import { Clock, Users, Code, Shield, Zap, Globe } from "lucide-react"

const features = [
  {
    icon: Clock,
    title: "Precise Timing",
    description: "Millisecond-accurate timing with support for in-game time, real time, and load-removed time.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "Built by runners, for runners. Every feature is designed with the community in mind.",
  },
  {
    icon: Code,
    title: "Open Source",
    description: "Fully open source under MIT license. Contribute, fork, or self-host your own instance.",
  },
  {
    icon: Shield,
    title: "Transparent Moderation",
    description: "Community-elected moderators with clear rules and public moderation logs.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built with modern tech for instant page loads and real-time leaderboard updates.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description: "Multi-language support and community hubs for speedrunners worldwide.",
  },
]

export function FeaturesSection() {
  return (
    <section className="border-t border-border bg-secondary/50 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for the speedrunning community
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground">
            Everything you need to track, submit, and compare speedruns — designed by runners who understand what matters.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-accent/10">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
