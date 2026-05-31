import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import { Link } from "wouter"

export default function Leaderboards() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Leaderboards</h1>
                <p className="mt-2 text-muted-foreground">Top times across all games and categories</p>
              </div>
              <Button asChild>
                <Link href="/submit">
                  <Trophy className="mr-2 h-4 w-4" />
                  Submit a run
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-28">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No runs yet</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Leaderboards are waiting to be filled. Add a game and submit your first run!
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link href="/games/new">Add a game</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/submit">Submit a run</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
