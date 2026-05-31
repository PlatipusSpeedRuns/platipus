import { Button } from "@/components/ui/button"
import { Gamepad2, Plus } from "lucide-react"
import Link from "next/link"

export function GamesSection() {
  return (
    <section className="border-t border-border px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Popular Games
            </h2>
            <p className="mt-2 text-muted-foreground">
              Browse speedrun leaderboards for your favorite games
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/games">
              View all games
            </Link>
          </Button>
        </div>

        {/* Empty state */}
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Gamepad2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No games yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            This is a blank canvas. Be the first to add a game and start building the leaderboards!
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
  )
}
