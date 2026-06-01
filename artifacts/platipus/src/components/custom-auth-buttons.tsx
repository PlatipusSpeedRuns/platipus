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

type Step = "idle" | "radicle";

export function CustomAuthButtons() {
  const [step, setStep] = useState<Step>("idle");

  if (step === "idle") {
    return (
      <div className="w-full space-y-2">
        <OAuthPopupButton
          provider="github"
          label="Continue with GitHub"
          icon={<GitHubIcon />}
        />
        <OAuthPopupButton
          provider="gitlab"
          label="Continue with GitLab"
          icon={<GitLabIcon />}
        />
        <OAuthPopupButton
          provider="codeberg"
          label="Continue with Codeberg"
          icon={<CodebergIcon />}
        />
        <OAuthPopupButton
          provider="gitea"
          label="Continue with Gitea"
          icon={<GiteaIcon />}
        />
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

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GitLabIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 01-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 014.82 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0118.6 2a.43.43 0 01.58 0 .42.42 0 01.11.18l2.44 7.51L23 13.45a.84.84 0 01-.35.94z" />
    </svg>
  );
}

function CodebergIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.955.49A12 12 0 0 0 0 12.49a12 12 0 0 0 12 12 12 12 0 0 0 12-12 12 12 0 0 0-12-12 12 12 0 0 0-.045 0zm0 1.5A10.5 10.5 0 0 1 22.5 12.49a10.5 10.5 0 0 1-10.5 10.5A10.5 10.5 0 0 1 1.5 12.49 10.5 10.5 0 0 1 11.955 1.99zM12 5.5a.75.75 0 0 0-.75.75v5.44L7.72 15.22a.75.75 0 0 0 0 1.06.75.75 0 0 0 1.06 0l3.75-3.75a.75.75 0 0 0 .22-.53V6.25A.75.75 0 0 0 12 5.5z"/>
    </svg>
  );
}

function GiteaIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
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
