import { Router } from "express";
import { clerkClient } from "@clerk/express";
import { base58 } from "@scure/base";
import crypto from "crypto";

// Ed25519 SubjectPublicKeyInfo DER prefix (OID 1.3.101.112) — used by Node's built-in crypto
const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

function publicKeyBytesFromDID(did: string): Buffer {
  if (!did.startsWith("did:key:z")) throw new Error("Expected did:key:z<base58btc>");
  const multikey = base58.decode(did.slice(9));
  if (multikey[0] !== 0xed || multikey[1] !== 0x01)
    throw new Error("Not an Ed25519 key (expected multicodec prefix 0xed 0x01)");
  if (multikey.length !== 34) throw new Error("Ed25519 public key must be 32 bytes");
  return Buffer.from(multikey.slice(2));
}

function verifyEd25519(pubKeyBytes: Buffer, message: Buffer, sigBytes: Buffer): boolean {
  const spki = Buffer.concat([ED25519_SPKI_PREFIX, pubKeyBytes]);
  const publicKey = crypto.createPublicKey({ key: spki, format: "der", type: "spki" });
  return crypto.verify(null, message, publicKey, sigBytes);
}

function getBase(req: import("express").Request): string {
  const proto = (req.headers["x-forwarded-proto"] ?? req.protocol) as string;
  const host = (req.headers["x-forwarded-host"] ?? req.headers.host) as string;
  return `${proto}://${host}`;
}

const router = Router();

const challenges = new Map<string, { nonce: string; createdAt: number }>();

setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, val] of challenges) {
    if (val.createdAt < cutoff) challenges.delete(key);
  }
}, 60_000);

// POST /api/auth/radicle/challenge
router.post("/radicle/challenge", (req, res) => {
  const { did } = req.body as { did?: string };
  if (!did || !did.startsWith("did:key:z")) {
    return void res.status(400).json({ error: "Invalid DID. Expected did:key:z<base58btc>" });
  }
  try {
    publicKeyBytesFromDID(did);
  } catch (err: any) {
    return void res.status(400).json({ error: err.message ?? "Invalid DID key" });
  }
  const nonce = crypto.randomBytes(32).toString("hex");
  challenges.set(did, { nonce, createdAt: Date.now() });
  res.json({ nonce });
});

// POST /api/auth/radicle/verify
router.post("/radicle/verify", async (req, res) => {
  const { did, signature } = req.body as { did?: string; signature?: string };
  if (!did || !signature) {
    return void res.status(400).json({ error: "Missing did or signature" });
  }

  const pending = challenges.get(did);
  if (!pending) {
    return void res.status(400).json({ error: "No challenge found. Click 'Get challenge' again." });
  }
  if (Date.now() - pending.createdAt > 10 * 60 * 1000) {
    challenges.delete(did);
    return void res.status(400).json({ error: "Challenge expired. Request a new one." });
  }

  try {
    const pubKeyBytes = publicKeyBytesFromDID(did);
    const sigClean = signature.trim().replace(/\s/g, "");
    let sigBuffer: Buffer;
    if (/^[0-9a-fA-F]{128}$/.test(sigClean)) {
      sigBuffer = Buffer.from(sigClean, "hex");
    } else if (/^[A-Za-z0-9+/]{86,88}={0,2}$/.test(sigClean)) {
      sigBuffer = Buffer.from(sigClean, "base64");
    } else {
      return void res.status(400).json({
        error: "Unrecognised signature format. Paste the full hex or base64 output of `rad auth --stdin`.",
      });
    }
    const nonceBuffer = Buffer.from(pending.nonce, "utf8");
    const ok = verifyEd25519(pubKeyBytes, nonceBuffer, sigBuffer);
    if (!ok) return void res.status(401).json({ error: "Signature does not match this DID." });
  } catch (err: any) {
    return void res.status(400).json({ error: "Signature check failed: " + (err.message ?? err) });
  }

  challenges.delete(did);

  try {
    const externalId = `rad_${did.replace(/[^a-zA-Z0-9]/g, "").slice(-24)}`;
    const existing = await clerkClient().users.getUserList({ externalId: [externalId] });
    let user = existing.data[0];
    if (!user) {
      user = await clerkClient().users.createUser({
        externalId,
        username: `radicle_${did.replace(/[^a-zA-Z0-9]/g, "").slice(-8)}`,
        skipPasswordRequirement: true,
        publicMetadata: { radicle_did: did },
      });
    }
    const { token } = await clerkClient().signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 300,
    });
    res.json({ ticket: token });
  } catch (err: any) {
    console.error("Clerk error (radicle):", err);
    const msg = err?.errors?.[0]?.longMessage ?? err?.message ?? "Unknown error";
    res.status(500).json({ error: "Failed to create session: " + msg });
  }
});

// GET /api/auth/gitea  — start OAuth flow
router.get("/gitea", (req, res) => {
  const giteaUrl = process.env.GITEA_URL?.replace(/\/$/, "");
  const clientId = process.env.GITEA_CLIENT_ID;
  if (!giteaUrl || !clientId) {
    return void res
      .status(503)
      .send("Gitea OAuth not configured. Set GITEA_URL, GITEA_CLIENT_ID, GITEA_CLIENT_SECRET.");
  }
  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `${getBase(req)}/api/auth/gitea/callback`;
  res.redirect(
    `${giteaUrl}/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&state=${state}`,
  );
});

// GET /api/auth/gitea/callback
router.get("/gitea/callback", async (req, res) => {
  const { code } = req.query as { code?: string };
  const base = getBase(req);

  if (!code) return void res.redirect(`${base}/?auth_error=gitea_cancelled`);

  const giteaUrl = (process.env.GITEA_URL ?? "").replace(/\/$/, "");
  const clientId = process.env.GITEA_CLIENT_ID ?? "";
  const clientSecret = process.env.GITEA_CLIENT_SECRET ?? "";
  const redirectUri = `${base}/api/auth/gitea/callback`;

  try {
    const tokenRes = await fetch(`${giteaUrl}/login/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return void res.redirect(`${base}/?auth_error=gitea_token_failed`);

    const userRes = await fetch(`${giteaUrl}/api/v1/user`, {
      headers: { Authorization: `token ${tokenData.access_token}` },
    });
    const giteaUser = (await userRes.json()) as {
      id: number;
      login: string;
      email?: string;
      full_name?: string;
    };
    if (!giteaUser.login) return void res.redirect(`${base}/?auth_error=gitea_user_failed`);

    const externalId = `gitea_${giteaUser.id}`;
    const existing = await clerkClient().users.getUserList({ externalId: [externalId] });
    let user = existing.data[0];
    if (!user) {
      const params: Record<string, unknown> = {
        externalId,
        username: `gitea_${giteaUser.login}`,
        skipPasswordRequirement: true,
        publicMetadata: { gitea_login: giteaUser.login },
      };
      if (giteaUser.full_name) {
        const parts = giteaUser.full_name.trim().split(/\s+/);
        params.firstName = parts[0];
        if (parts.length > 1) params.lastName = parts.slice(1).join(" ");
      }
      if (giteaUser.email) params.emailAddress = [giteaUser.email];
      user = await clerkClient().users.createUser(
        params as Parameters<ReturnType<typeof clerkClient>["users"]["createUser"]>[0],
      );
    }

    const { token } = await clerkClient().signInTokens.createSignInToken({
      userId: user.id,
      expiresInSeconds: 300,
    });

    res.redirect(
      `${base}/auth/callback` +
        `?ticket=${encodeURIComponent(token)}` +
        `&provider=gitea` +
        `&username=${encodeURIComponent(giteaUser.login)}`,
    );
  } catch (err: any) {
    console.error("Gitea callback error:", err?.message ?? err);
    res.redirect(`${base}/?auth_error=gitea_error`);
  }
});

export default router;
