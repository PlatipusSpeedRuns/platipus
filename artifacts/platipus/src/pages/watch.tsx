import { useEffect, useRef, useState } from "react"
import { useParams, Link } from "wouter"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Loader2, Radio, Users } from "lucide-react"

type ViewerState = "connecting" | "waiting" | "live" | "ended"

export default function WatchStream() {
  const { streamKey } = useParams<{ streamKey: string }>()
  const [state, setState] = useState<ViewerState>("connecting")
  const [viewerCount, setViewerCount] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const sourceBufferRef = useRef<SourceBuffer | null>(null)
  const queueRef = useRef<ArrayBuffer[]>([])

  useEffect(() => {
    if (!streamKey) return

    const video = videoRef.current
    if (!video) return

    const mediaSource = new MediaSource()
    const objectUrl = URL.createObjectURL(mediaSource)
    video.src = objectUrl

    function processQueue() {
      const sb = sourceBufferRef.current
      if (!sb || sb.updating || queueRef.current.length === 0) return
      const chunk = queueRef.current.shift()!
      try {
        sb.appendBuffer(chunk)
      } catch {
        queueRef.current = []
      }
    }

    mediaSource.addEventListener("sourceopen", () => {
      const types = [
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ]
      const mimeType = types.find((t) => MediaSource.isTypeSupported(t)) ?? "video/webm"
      try {
        const sb = mediaSource.addSourceBuffer(mimeType)
        sb.mode = "sequence"
        sb.addEventListener("updateend", processQueue)
        sourceBufferRef.current = sb
      } catch {}
    })

    const proto = window.location.protocol === "https:" ? "wss:" : "ws:"
    const ws = new WebSocket(
      `${proto}//${window.location.host}/api/ws/stream?key=${encodeURIComponent(streamKey)}&role=view`,
    )
    wsRef.current = ws

    ws.onmessage = async (e) => {
      if (typeof e.data === "string") {
        try {
          const msg = JSON.parse(e.data) as { type: string; count?: number }
          if (msg.type === "waiting") setState("waiting")
          if (msg.type === "stream_ended") setState("ended")
          if (msg.type === "viewer_count" && msg.count !== undefined) setViewerCount(msg.count)
        } catch {}
      } else {
        setState("live")
        const buf =
          e.data instanceof ArrayBuffer ? e.data : await (e.data as Blob).arrayBuffer()
        queueRef.current.push(buf)
        processQueue()
      }
    }

    ws.onerror = () => setState("ended")
    ws.onclose = () => setState((prev) => (prev === "live" ? "ended" : prev))

    return () => {
      ws.close()
      URL.revokeObjectURL(objectUrl)
    }
  }, [streamKey])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {/* Player */}
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                className="h-full w-full"
                style={{ display: state === "live" ? "block" : "none" }}
              />

              {state !== "live" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                  {state === "connecting" && (
                    <>
                      <Loader2 className="h-10 w-10 animate-spin opacity-70" />
                      <p className="text-sm opacity-70">Connecting…</p>
                    </>
                  )}
                  {state === "waiting" && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                        <Radio className="h-8 w-8" />
                      </div>
                      <p className="font-semibold">Stream hasn't started yet</p>
                      <p className="text-sm opacity-70">The streamer will go live soon</p>
                    </>
                  )}
                  {state === "ended" && (
                    <>
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                        <Radio className="h-8 w-8" />
                      </div>
                      <p className="font-semibold">Stream ended</p>
                      <p className="text-sm opacity-70">Thanks for watching!</p>
                      <Button variant="outline" className="mt-2 text-white border-white/30 hover:bg-white/10" asChild>
                        <Link href="/">Go home</Link>
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Live badge + viewer count */}
              {state === "live" && (
                <>
                  <div className="absolute left-3 top-3 flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                    <span className="rounded bg-black/70 px-2 py-0.5 text-xs font-bold text-white">
                      LIVE
                    </span>
                  </div>
                  {viewerCount > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
                      <Users className="h-3 w-3" />
                      {viewerCount}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Info bar */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Stream key: <code className="font-mono">{streamKey}</code>
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/">Back to Platipus</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
