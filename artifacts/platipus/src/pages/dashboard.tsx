import { useEffect, useRef, useState } from "react"
import { useUser, useAuth } from "@clerk/react"
import { Redirect } from "wouter"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  MonitorPlay,
  Radio,
  Settings2,
  Tv2,
  Users,
} from "lucide-react"

type StreamStatus = "loading" | "none" | "pending" | "approved"

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const { getToken } = useAuth()

  const [streamStatus, setStreamStatus] = useState<StreamStatus>("loading")
  const [streamKey, setStreamKey] = useState("")
  const [streamKeyVisible, setStreamKeyVisible] = useState(false)
  const [approvalCode, setApprovalCode] = useState("")
  const [approving, setApproving] = useState(false)
  const [approvalError, setApprovalError] = useState("")
  const [requesting, setRequesting] = useState(false)

  const [isLive, setIsLive] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const [streamError, setStreamError] = useState("")
  const [copied, setCopied] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  async function authFetch(path: string, init?: RequestInit) {
    const token = await getToken()
    return fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async function loadStatus() {
    try {
      const res = await authFetch("/api/stream/status")
      if (res.ok) {
        const data = (await res.json()) as { status: StreamStatus; streamKey?: string }
        setStreamStatus(data.status)
        if (data.streamKey) setStreamKey(data.streamKey)
      } else {
        setStreamStatus("none")
      }
    } catch {
      setStreamStatus("none")
    }
  }

  useEffect(() => {
    if (user) loadStatus()
  }, [user])

  async function requestPermission() {
    setRequesting(true)
    try {
      const res = await authFetch("/api/stream/request", { method: "POST" })
      if (res.ok) {
        const data = (await res.json()) as { status: StreamStatus }
        setStreamStatus(data.status)
      }
    } catch {}
    setRequesting(false)
  }

  async function submitApprovalCode() {
    setApproving(true)
    setApprovalError("")
    try {
      const res = await authFetch("/api/stream/approve", {
        method: "POST",
        body: JSON.stringify({ code: approvalCode }),
      })
      const data = (await res.json()) as { status?: StreamStatus; streamKey?: string; error?: string }
      if (res.ok) {
        setStreamStatus("approved")
        if (data.streamKey) setStreamKey(data.streamKey)
        setApprovalCode("")
      } else {
        setApprovalError(data.error ?? "Invalid code. Ask the admin for your approval code.")
      }
    } catch {
      setApprovalError("Network error. Try again.")
    }
    setApproving(false)
  }

  async function startStream() {
    setStreamError("")
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      })
      mediaStreamRef.current = mediaStream

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
      const ws = new WebSocket(
        `${proto}//${window.location.host}/api/ws/stream?key=${encodeURIComponent(streamKey)}&role=broadcast`,
      )
      wsRef.current = ws

      ws.onopen = () => {
        const types = [
          "video/webm;codecs=vp9,opus",
          "video/webm;codecs=vp8,opus",
          "video/webm",
        ]
        const mimeType = types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "video/webm"
        const recorder = new MediaRecorder(mediaStream, { mimeType, videoBitsPerSecond: 2_500_000 })
        recorderRef.current = recorder
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) ws.send(e.data)
        }
        recorder.start(500)
        setIsLive(true)
      }

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data as string) as { type: string; count?: number }
          if (msg.type === "viewer_count" && msg.count !== undefined) setViewerCount(msg.count)
        } catch {}
      }

      ws.onerror = () =>
        setStreamError("Connection failed. Make sure the API server is running.")

      mediaStream.getTracks().forEach((t) => {
        t.onended = () => stopStream()
      })
    } catch (err) {
      if ((err as Error).name !== "NotAllowedError") {
        setStreamError("Could not capture screen. Please try again.")
      }
    }
  }

  function stopStream() {
    recorderRef.current?.stop()
    recorderRef.current = null
    wsRef.current?.close()
    wsRef.current = null
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setIsLive(false)
    setViewerCount(0)
  }

  function copyViewerLink() {
    navigator.clipboard.writeText(`${window.location.origin}/watch/${streamKey}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => () => stopStream(), [])

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return <Redirect to="/sign-in" />

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Welcome back,{" "}
              <span className="font-medium text-foreground">
                {user.firstName ?? user.username ?? "runner"}
              </span>
            </p>
          </div>

          {/* Live Streaming Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                  <Tv2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    Live Streaming
                    {isLive && (
                      <Badge className="animate-pulse bg-red-500 text-white">LIVE</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Stream your speedruns live to the Platipus community
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Loading */}
              {streamStatus === "loading" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking streaming status…
                </div>
              )}

              {/* No permission yet */}
              {streamStatus === "none" && (
                <div className="rounded-xl border-2 border-dashed border-border p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Radio className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-3 font-semibold text-foreground">Streaming not enabled</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
                    Request permission to go live and broadcast your runs to viewers.
                  </p>
                  <Button
                    className="mt-5"
                    onClick={requestPermission}
                    disabled={requesting}
                  >
                    {requesting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Requesting…
                      </>
                    ) : (
                      "Request streaming permission"
                    )}
                  </Button>
                </div>
              )}

              {/* Pending approval */}
              {streamStatus === "pending" && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-400">
                        Request pending review
                      </p>
                      <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-500">
                        Once approved, the admin will give you a code to enter below to activate streaming.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approvalCode">Enter approval code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="approvalCode"
                        placeholder="Paste the code from the admin"
                        value={approvalCode}
                        onChange={(e) => setApprovalCode(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && approvalCode.trim() && submitApprovalCode()}
                      />
                      <Button
                        onClick={submitApprovalCode}
                        disabled={approving || !approvalCode.trim()}
                      >
                        {approving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unlock"}
                      </Button>
                    </div>
                    {approvalError && (
                      <p className="flex items-center gap-1.5 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {approvalError}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Approved - full streaming UI */}
              {streamStatus === "approved" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Streaming approved
                  </div>

                  {/* Stream key */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Settings2 className="h-4 w-4" />
                      Your stream key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type={streamKeyVisible ? "text" : "password"}
                        value={streamKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setStreamKeyVisible(!streamKeyVisible)}
                        title={streamKeyVisible ? "Hide key" : "Show key"}
                      >
                        {streamKeyVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigator.clipboard.writeText(streamKey)}
                        title="Copy key"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* OBS settings info */}
                  <div className="rounded-lg border border-border bg-secondary/40 p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MonitorPlay className="h-4 w-4" />
                      OBS Studio Settings
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-medium">Custom RTMP</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="flex-shrink-0 text-muted-foreground">Server</span>
                        <code className="truncate rounded bg-secondary px-1.5 py-0.5 text-xs">
                          rtmp://your-domain.com/live
                        </code>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="flex-shrink-0 text-muted-foreground">Stream Key</span>
                        <code className="truncate rounded bg-secondary px-1.5 py-0.5 text-xs font-mono">
                          {streamKeyVisible ? streamKey : "••••••••••••"}
                        </code>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Replace <strong>your-domain.com</strong> with your deployed Platipus server address.
                      OBS RTMP requires a full deployment — use browser streaming below in development.
                    </p>
                  </div>

                  {/* Browser streaming */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Tv2 className="h-4 w-4" />
                      Browser Streaming
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        Works now
                      </span>
                    </h4>

                    {isLive && (
                      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="h-full w-full object-contain"
                        />
                        <div className="absolute left-3 top-3 flex items-center gap-2">
                          <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                          <span className="rounded bg-black/70 px-2 py-0.5 text-xs font-bold text-white tracking-wide">
                            LIVE
                          </span>
                        </div>
                        {viewerCount > 0 && (
                          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                            <Users className="h-3 w-3" />
                            {viewerCount} viewer{viewerCount !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                      {!isLive ? (
                        <Button
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={startStream}
                        >
                          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-white" />
                          Go Live
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
                          onClick={stopStream}
                        >
                          Stop Stream
                        </Button>
                      )}
                      {isLive && (
                        <Button variant="outline" onClick={copyViewerLink}>
                          <Copy className="mr-2 h-4 w-4" />
                          {copied ? "Copied!" : "Copy viewer link"}
                        </Button>
                      )}
                    </div>

                    {streamError && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {streamError}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
