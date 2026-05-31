import { Button } from "@/components/ui/button"
import { Trophy, Users } from "lucide-react"
import { Link } from "wouter"

export function LeaderboardPreview() {
  return (
    <section className="border-t border-border bg-secondary/50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Recent Runs
            </h2>
            <p className="mt-2 text-muted-foreground">
              The latest verified speedruns from the community
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/runs">
              View all runs
            </Link>
          </Button>
        </div>

        {/* Empty state */}
        <div className="mt-12 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Trophy className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-foreground">No runs submitted yet</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            The leaderboards are waiting to be filled. Submit the first run and claim your spot!
          </p>
          <Button className="mt-6" asChild>
            <Link href="/submit">
              Submit a run
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
