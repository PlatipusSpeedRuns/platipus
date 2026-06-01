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

// ── Radicle DID ───────────────────────────────────────────────────────────────

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

// ── Forgejo token auth (same Gitea API, any Forgejo instance) ─────────────────

router.post("/forgejo/token", async (req, res) => {
  const { forgejoUrl: rawUrl, token } = req.body as { forgejoUrl?: string; token?: string };
  if (!rawUrl || !token) {
    return void res.status(400).json({ error: "forgejoUrl and token are required" });
  }
  const forgejoUrl = rawUrl.replace(/\/$/, "");

  try {
    const userRes = await fetch(`${forgejoUrl}/api/v1/user`, {
      headers: { Authorization: `token ${token}` },
    });
    if (!userRes.ok) {
      return void res.status(401).json({ error: "Invalid token or unreachable Forgejo instance" });
    }
    const fjUser = (await userRes.json()) as { id: number; login: string; email?: string; full_name?: string };
    if (!fjUser.login) return void res.status(401).json({ error: "Could not read user from Forgejo" });

    const host = new URL(forgejoUrl).hostname;
    const externalId = `forgejo_${host}_${fjUser.id}`;
    const existing = await clerkClient().users.getUserList({ externalId: [externalId] });
    let user = existing.data[0];
    if (!user) {
      const params: Record<string, unknown> = {
        externalId,
        username: `forgejo_${fjUser.login}`.slice(0, 64),
        skipPasswordRequirement: true,
        publicMetadata: { forgejo_login: fjUser.login, forgejo_url: forgejoUrl },
      };
      if (fjUser.full_name) {
        const parts = fjUser.full_name.trim().split(/\s+/);
        params.firstName = parts[0];
        if (parts.length > 1) params.lastName = parts.slice(1).join(" ");
      }
      if (fjUser.email) params.emailAddress = [fjUser.email];
      user = await clerkClient().users.createUser(
        params as Parameters<ReturnType<typeof clerkClient>["users"]["createUser"]>[0],
      );
    }
    const { token: ticket } = await clerkClient().signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 300 });
    res.json({ ticket, username: fjUser.login });
  } catch (err: any) {
    console.error("Forgejo token verify error:", err?.message ?? err);
    res.status(500).json({ error: "Failed to verify token: " + (err?.message ?? "unknown error") });
  }
});

// ── Sourcehut personal access token ──────────────────────────────────────────

router.post("/sourcehut/token", async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    return void res.status(400).json({ error: "token is required" });
  }

  try {
    const userRes = await fetch("https://meta.sr.ht/api/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) {
      return void res.status(401).json({ error: "Invalid token or could not reach meta.sr.ht" });
    }
    const shUser = (await userRes.json()) as {
      id: number;
      name: string;
      canonical_name: string;
      email?: string;
    };
    if (!shUser.canonical_name) {
      return void res.status(401).json({ error: "Could not read user from Sourcehut" });
    }

    const username = shUser.canonical_name.replace(/^~/, "");
    const externalId = `sourcehut_${shUser.id}`;
    const existing = await clerkClient().users.getUserList({ externalId: [externalId] });
    let user = existing.data[0];
    if (!user) {
      const params: Record<string, unknown> = {
        externalId,
        username: `sh_${username}`.slice(0, 64),
        skipPasswordRequirement: true,
        publicMetadata: { sourcehut_username: shUser.canonical_name },
      };
      if (shUser.name) {
        const parts = shUser.name.trim().split(/\s+/);
        params.firstName = parts[0];
        if (parts.length > 1) params.lastName = parts.slice(1).join(" ");
      }
      if (shUser.email) params.emailAddress = [shUser.email];
      user = await clerkClient().users.createUser(
        params as Parameters<ReturnType<typeof clerkClient>["users"]["createUser"]>[0],
      );
    }
    const { token: ticket } = await clerkClient().signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 300 });
    res.json({ ticket, username: shUser.canonical_name });
  } catch (err: any) {
    console.error("Sourcehut token verify error:", err?.message ?? err);
    res.status(500).json({ error: "Failed to verify token: " + (err?.message ?? "unknown error") });
  }
});

// ── Twitch OAuth ──────────────────────────────────────────────────────────────

router.get("/twitch", (req, res) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  if (!clientId) {
    return void res.status(503).send("Twitch OAuth not configured. Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET.");
  }
  const redirectUri = `${getBase(req)}/api/auth/twitch/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "user:read:email",
  });
  res.redirect(`https://id.twitch.tv/oauth2/authorize?${params}`);
});

router.get("/twitch/callback", async (req, res) => {
  const { code } = req.query as { code?: string };
  const base = getBase(req);
  if (!code) return void res.redirect(`${base}/?auth_error=twitch_cancelled`);

  const clientId = process.env.TWITCH_CLIENT_ID ?? "";
  const clientSecret = process.env.TWITCH_CLIENT_SECRET ?? "";
  const redirectUri = `${base}/api/auth/twitch/callback`;

  try {
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return void res.redirect(`${base}/?auth_error=twitch_token_failed`);

    const userRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Client-Id": clientId,
      },
    });
    const userData = (await userRes.json()) as {
      data?: { id: string; login: string; display_name: string; email?: string }[];
    };
    const twUser = userData.data?.[0];
    if (!twUser) return void res.redirect(`${base}/?auth_error=twitch_user_failed`);

    const externalId = `twitch_${twUser.id}`;
    const existing = await clerkClient().users.getUserList({ externalId: [externalId] });
    let user = existing.data[0];
    if (!user) {
      const params: Record<string, unknown> = {
        externalId,
        username: `tw_${twUser.login}`.slice(0, 64),
        skipPasswordRequirement: true,
        publicMetadata: { twitch_login: twUser.login, twitch_display_name: twUser.display_name },
      };
      if (twUser.display_name) {
        const parts = twUser.display_name.trim().split(/\s+/);
        params.firstName = parts[0];
        if (parts.length > 1) params.lastName = parts.slice(1).join(" ");
      }
      if (twUser.email) params.emailAddress = [twUser.email];
      user = await clerkClient().users.createUser(
        params as Parameters<ReturnType<typeof clerkClient>["users"]["createUser"]>[0],
      );
    }
    const { token } = await clerkClient().signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 300 });
    res.redirect(
      `${base}/auth/callback?ticket=${encodeURIComponent(token)}&provider=twitch&username=${encodeURIComponent(twUser.login)}`,
    );
  } catch (err: any) {
    console.error("Twitch callback error:", err?.message ?? err);
    res.redirect(`${base}/?auth_error=twitch_error`);
  }
});

// ── Discord OAuth ─────────────────────────────────────────────────────────────

router.get("/discord", (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) {
    return void res.status(503).send("Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET.");
  }
  const redirectUri = `${getBase(req)}/api/auth/discord/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
});

router.get("/discord/callback", async (req, res) => {
  const { code } = req.query as { code?: string };
  const base = getBase(req);
  if (!code) return void res.redirect(`${base}/?auth_error=discord_cancelled`);

  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  const clientSecret = process.env.DISCORD_CLIENT_SECRET ?? "";
  const redirectUri = `${base}/api/auth/discord/callback`;

  try {
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return void res.redirect(`${base}/?auth_error=discord_token_failed`);

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const dcUser = (await userRes.json()) as {
      id: string;
      username: string;
      global_name?: string;
      email?: string;
    };
    if (!dcUser.id) return void res.redirect(`${base}/?auth_error=discord_user_failed`);

    const externalId = `discord_${dcUser.id}`;
    const existing = await clerkClient().users.getUserList({ externalId: [externalId] });
    let user = existing.data[0];
    if (!user) {
      const displayName = dcUser.global_name ?? dcUser.username;
      const params: Record<string, unknown> = {
        externalId,
        username: `dc_${dcUser.username}`.slice(0, 64),
        skipPasswordRequirement: true,
        publicMetadata: { discord_username: dcUser.username, discord_id: dcUser.id },
      };
      if (displayName) {
        const parts = displayName.trim().split(/\s+/);
        params.firstName = parts[0];
        if (parts.length > 1) params.lastName = parts.slice(1).join(" ");
      }
      if (dcUser.email) params.emailAddress = [dcUser.email];
      user = await clerkClient().users.createUser(
        params as Parameters<ReturnType<typeof clerkClient>["users"]["createUser"]>[0],
      );
    }
    const { token } = await clerkClient().signInTokens.createSignInToken({ userId: user.id, expiresInSeconds: 300 });
    res.redirect(
      `${base}/auth/callback?ticket=${encodeURIComponent(token)}&provider=discord&username=${encodeURIComponent(dcUser.username)}`,
    );
  } catch (err: any) {
    console.error("Discord callback error:", err?.message ?? err);
    res.redirect(`${base}/?auth_error=discord_error`);
  }
});

export default router;
