import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Gamepad2, Loader2 } from "lucide-react"
import { Link } from "wouter"

export default function AddGame() {
  const [gameName, setGameName] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [notPlatformer, setNotPlatformer] = useState(false)
  const [isModded, setIsModded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gameName.trim() || !videoUrl.trim()) return

    setSubmitting(true)
    setError("")

    try {
      const res = await fetch("https://formsubmit.co/ajax/caiiummog@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          _subject: `Platipus game request: ${gameName}`,
          "Game Name": gameName,
          "Video URL": videoUrl,
          "Not a platformer": notPlatformer ? "Yes" : "No",
          "Game is modded": isModded ? "Yes" : "No",
          _captcha: "false",
          _template: "table",
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && (data.success === "true" || data.success === true)) {
        setSubmitted(true)
      } else {
        setError("Submission failed — please try again or email caiiummog@gmail.com directly.")
      }
    } catch {
      setError("Network error. Please check your connection and try again.")
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
            <h1 className="mt-4 text-2xl font-bold text-foreground">Game submitted!</h1>
            <p className="mx-auto mt-2 max-w-sm text-muted-foreground">
              Your game request has been sent for review. We'll be in touch soon.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button asChild>
                <Link href="/games">Browse games</Link>
              </Button>
              <Button variant="outline" onClick={() => { setSubmitted(false); setGameName(""); setVideoUrl(""); setNotPlatformer(false); setIsModded(false) }}>
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
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Add a game</CardTitle>
                <CardDescription>
                  Request to add a game to the Platipus leaderboards
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="gameName">
                  Game name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="gameName"
                  placeholder="e.g. Super Mario Bros."
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">
                  Video URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="videoUrl"
                  type="url"
                  placeholder="https://youtube.com/watch?v=…"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A YouTube / Twitch link showing a speedrun of this game
                </p>
              </div>

              <div className="space-y-2">
                <Label>Other (optional)</Label>
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="notPlatformer"
                      checked={notPlatformer}
                      onCheckedChange={(v) => setNotPlatformer(Boolean(v))}
                      className="mt-0.5"
                    />
                    <div>
                      <label
                        htmlFor="notPlatformer"
                        className="cursor-pointer text-sm font-medium text-foreground"
                      >
                        Not a platformer
                      </label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Platipus mainly focuses on platformer games. Check this if your game is a different genre.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="isModded"
                      checked={isModded}
                      onCheckedChange={(v) => setIsModded(Boolean(v))}
                      className="mt-0.5"
                    />
                    <div>
                      <label
                        htmlFor="isModded"
                        className="cursor-pointer text-sm font-medium text-foreground"
                      >
                        Game is modded
                      </label>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        The game is a mod or ROM hack of an original title.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !gameName.trim() || !videoUrl.trim()}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Submit game request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
