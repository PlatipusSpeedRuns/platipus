import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Gamepad2, Plus, Search } from "lucide-react"
import { Link } from "wouter"

export default function Games() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Games</h1>
                <p className="mt-2 text-muted-foreground">
                  Browse speedrun leaderboards for your favorite games
                </p>
              </div>
              <Button asChild>
                <Link href="/games/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add a game
                </Link>
              </Button>
            </div>
            <div className="relative mt-6 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search games…" className="pl-9" />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-28">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Gamepad2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No games yet</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Platipus focuses on platformers but welcomes all speedruns. Be the first to add a game!
              </p>
              <Button className="mt-6" asChild>
                <Link href="/games/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add a game
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
