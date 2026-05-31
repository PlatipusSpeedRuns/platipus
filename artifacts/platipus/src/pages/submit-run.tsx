import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader2, Trophy } from "lucide-react"
import { Link } from "wouter"

export default function SubmitRun() {
  const [gameName, setGameName] = useState("")
  const [category, setCategory] = useState("")
  const [runTime, setRunTime] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gameName.trim() || !runTime.trim() || !videoUrl.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("https://formsubmit.co/ajax/caiiummog@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Platipus run submission: ${gameName} — ${runTime}`,
          "Game": gameName,
          "Category": category || "Any%",
          "Time": runTime,
          "Video URL": videoUrl,
          _captcha: "false",
          _template: "table",
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && (data.success === "true" || data.success === true)) {
        setSubmitted(true)
      } else {
        setError("Submission failed — please try again.")
      }
    } catch {
      setError("Network error. Please check your connection.")
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-foreground">Run submitted!</h1>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              Your run has been sent for review and will appear on the leaderboard once verified.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link href="/leaderboards">View leaderboards</Link>
              </Button>
              <Button variant="outline" onClick={() => { setSubmitted(false); setGameName(""); setCategory(""); setRunTime(""); setVideoUrl("") }}>
                Submit another
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Submit a run</CardTitle>
                <CardDescription>Submit your speedrun for review and leaderboard placement</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="gameName">Game <span className="text-destructive">*</span></Label>
                <Input id="gameName" placeholder="e.g. Super Mario Bros." value={gameName} onChange={(e) => setGameName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="e.g. Any%, 100%, Glitchless" value={category} onChange={(e) => setCategory(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="runTime">Time <span className="text-destructive">*</span></Label>
                <Input id="runTime" placeholder="e.g. 4:58.23 or 1:23:45" value={runTime} onChange={(e) => setRunTime(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL <span className="text-destructive">*</span></Label>
                <Input id="videoUrl" type="url" placeholder="https://youtube.com/watch?v=…" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting || !gameName.trim() || !runTime.trim() || !videoUrl.trim()}>
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</> : "Submit run"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
