import { useState } from "react";
import { useSignIn } from "@clerk/react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}/api/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

type Step = "idle" | "radicle" | "forgejo" | "sourcehut";

export function CustomAuthButtons() {
  const [step, setStep] = useState<Step>("idle");

  if (step === "idle") {
    return (
      <div className="w-full space-y-2">
        <OAuthPopupButton
          provider="twitch"
          label="Continue with Twitch"
          icon={<TwitchIcon />}
        />
        <OAuthPopupButton
          provider="discord"
          label="Continue with Discord"
          icon={<DiscordIcon />}
        />
        <button
          onClick={() => setStep("forgejo")}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <ForgejoIcon />
          Continue with Forgejo
        </button>
        <button
          onClick={() => setStep("sourcehut")}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <SourcehutIcon />
          Continue with Sourcehut
        </button>
        <button
          onClick={() => setStep("radicle")}
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <RadicleIcon />
          Continue with Radicle DID
        </button>
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>
    );
  }

  if (step === "forgejo") return <ForgejoFlow onBack={() => setStep("idle")} />;
  if (step === "sourcehut") return <SourcehutFlow onBack={() => setStep("idle")} />;
  return <RadicleFlow onBack={() => setStep("idle")} />;
}

function OAuthPopupButton({
  provider,
  label,
  icon,
}: {
  provider: string;
  label: string;
  icon: React.ReactNode;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function handleClick() {
    setError("");
    setPending(true);
    const popup = window.open(
      `${BASE_URL}/api/auth/${provider}`,
      `${provider}-auth`,
      "width=600,height=700,left=200,top=100",
    );

    if (!popup) {
      setError("Pop-up blocked — allow pop-ups for this site and try again.");
      setPending(false);
      return;
    }

    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type !== "platipus:auth:complete") return;
      window.removeEventListener("message", onMessage);
      clearInterval(poll);
      setPending(false);
      window.location.href = `${BASE_URL}/dashboard`;
    }
    window.addEventListener("message", onMessage);

    const poll = setInterval(() => {
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener("message", onMessage);
        setPending(false);
      }
    }, 500);
  }

  return (
    <div className="space-y-0.5">
      <button
        onClick={handleClick}
        disabled={pending}
        type="button"
        className="flex w-full items-center justify-center gap-2 rounded-[0.625rem] border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {icon}
        {pending ? `Waiting for ${provider}…` : label}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function ForgejoFlow({ onBack }: { onBack: () => void }) {
  const [forgejoUrl, setForgejoUrl] = useState("https://");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();

  async function handleSubmit() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("forgejo/token", { forgejoUrl: forgejoUrl.trim(), token: token.trim() });
      const result = await signIn!.create({ strategy: "ticket", ticket: data.ticket });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        navigate("/dashboard");
      }
    } catch (e: any) {
      setError(e.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const tokenUrl = forgejoUrl.startsWith("https://") && forgejoUrl.length > 8
    ? `${forgejoUrl.replace(/\/$/, "")}/-/user/settings/applications`
    : null;

  return (
    <div className="w-full rounded-[0.625rem] border border-border bg-background p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors" type="button" aria-label="Back">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <ForgejoIcon />
          <span className="text-sm font-semibold text-foreground">Sign in with Forgejo</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Your Forgejo instance URL</Label>
          <Input
            placeholder="https://forgejo.example.com"
            value={forgejoUrl}
            onChange={(e) => setForgejoUrl(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Personal access token</Label>
            {tokenUrl && (
              <a href={tokenUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                Generate token →
              </a>
            )}
          </div>
          <Input
            type="password"
            placeholder="Paste your token…"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            In your Forgejo: Settings → Applications → Generate Token (any scope works)
          </p>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={loading || !token || !forgejoUrl.startsWith("http")}
          size="sm"
          className="w-full"
        >
          {loading ? "Verifying…" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

function SourcehutFlow({ onBack }: { onBack: () => void }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();

  async function handleSubmit() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const data = await apiPost("sourcehut/token", { token: token.trim() });
      const result = await signIn!.create({ strategy: "ticket", ticket: data.ticket });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        navigate("/dashboard");
      }
    } catch (e: any) {
      setError(e.message ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-[0.625rem] border border-border bg-background p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors" type="button" aria-label="Back">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <SourcehutIcon />
          <span className="text-sm font-semibold text-foreground">Sign in with Sourcehut</span>
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Personal access token</Label>
            <a
              href="https://meta.sr.ht/oauth2/personal-token"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              Generate token →
            </a>
          </div>
          <Input
            type="password"
            placeholder="Paste your token…"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Go to meta.sr.ht → OAuth2 → Personal Access Tokens → New token (no special grants needed)
          </p>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <Button
          onClick={handleSubmit}
          disabled={loading || !token}
          size="sm"
          className="w-full"
        >
          {loading ? "Verifying…" : "Sign in"}
        </Button>
      </div>
    </div>
  );
}

function RadicleFlow({ onBack }: { onBack: () => void }) {
  const [did, setDid] = useState("");
  const [nonce, setNonce] = useState("");
  const [sig, setSig] = useState("");
  const [phase, setPhase] = useState<"did" | "challenge" | "sig">("did");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();

  async function getChallenge() {
    setError("");
    setLoading(true);
    try {
      const { nonce: n } = await apiPost("radicle/challenge", { did: did.trim() });
      setNonce(n);
      setPhase("challenge");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!isLoaded) return;
    setError("");
    setLoading(true);
    try {
      const { ticket } = await apiPost("radicle/verify", { did: did.trim(), signature: sig.trim() });
      const result = await signIn!.create({ strategy: "ticket", ticket });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        navigate("/dashboard");
      }
    } catch (e: any) {
      setError(e.message ?? e?.errors?.[0]?.longMessage ?? "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  const command = `echo -n "${nonce}" | rad auth --stdin`;

  return (
    <div className="w-full rounded-[0.625rem] border border-border bg-background p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="text-muted-foreground hover:text-foreground transition-colors"
          type="button"
          aria-label="Back"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5">
          <RadicleIcon />
          <span className="text-sm font-semibold text-foreground">Sign in with Radicle DID</span>
        </div>
      </div>

      {phase === "did" && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Your Radicle DID</Label>
            <Input
              placeholder="did:key:z6Mk…"
              value={did}
              onChange={(e) => setDid(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button
            onClick={getChallenge}
            disabled={loading || !did.startsWith("did:key:z")}
            size="sm"
            className="w-full"
          >
            {loading ? "Requesting…" : "Get challenge →"}
          </Button>
        </div>
      )}

      {(phase === "challenge" || phase === "sig") && (
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground">Step 1 — Run this in your terminal:</p>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <code className="flex-1 break-all text-xs text-foreground">{command}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(command)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                title="Copy"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Step 2 — Paste the output:</Label>
            <Input
              placeholder="Hex or base64 signature…"
              value={sig}
              onChange={(e) => {
                setSig(e.target.value);
                setPhase("sig");
              }}
              className="font-mono text-sm"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPhase("did");
                setNonce("");
                setSig("");
                setError("");
              }}
            >
              Back
            </Button>
            <Button onClick={verify} disabled={loading || !sig} size="sm" className="flex-1">
              {loading ? "Verifying…" : "Verify & sign in"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function TwitchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function ForgejoIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

function SourcehutIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function RadicleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  );
}
