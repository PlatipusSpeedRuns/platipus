import { useEffect, useRef, useState } from "react";
import { useSignIn } from "@clerk/react";
import { useLocation, useSearch } from "wouter";

export default function AuthCallback() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const ticket = params.get("ticket") ?? "";
  const provider = params.get("provider") ?? "";
  const username = params.get("username") ?? "";

  const { signIn, setActive, isLoaded } = useSignIn();
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (!isLoaded || ran.current) return;
    ran.current = true;

    if (!ticket) {
      setStatus("error");
      setErrorMsg("No authentication ticket found.");
      return;
    }

    (async () => {
      try {
        const result = await signIn!.create({ strategy: "ticket", ticket });
        if (result.status === "complete") {
          await setActive!({ session: result.createdSessionId });
          if (window.opener) {
            window.opener.postMessage(
              { type: "platipus:auth:complete", provider, username },
              window.location.origin,
            );
            window.close();
          } else {
            setStatus("success");
            setTimeout(() => navigate("/dashboard"), 1200);
          }
        } else {
          throw new Error("Incomplete sign-in: " + result.status);
        }
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err?.errors?.[0]?.longMessage ?? err?.message ?? "Authentication failed.");
      }
    })();
  }, [isLoaded]);

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Completing sign-in…</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">Signed in{username ? ` as ${username}` : ""}!</p>
            <p className="mt-1 text-sm text-muted-foreground">Redirecting to your dashboard…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-semibold text-foreground">Sign-in failed</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMsg}</p>
            <a href="/sign-in" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Back to sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
