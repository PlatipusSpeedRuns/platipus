import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Heart } from "lucide-react"
import { Link } from "wouter"

export function CTASection() {
  return (
    <section className="border-t border-border px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm">
          <Heart className="h-4 w-4 text-accent" />
          <span className="text-muted-foreground">Free forever, open source always</span>
        </div>

        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to join the community?
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          Start tracking your runs, compete on leaderboards, and connect with speedrunners around the world. No ads, no paywalls, just pure speedrunning.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/signup">
              Create an account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <a href="https://github.com/platipus-speedruns/platipus" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              Contribute
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
