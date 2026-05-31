import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, MessageSquare, Users, Zap } from "lucide-react"

export default function Community() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Community</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Connect with speedrunners, share strats, and build the leaderboards together.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/20">
                    <MessageSquare className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardTitle className="mt-3">Discord</CardTitle>
                  <CardDescription>
                    Join the conversation, find co-op partners, and get run feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="#" target="_blank" rel="noopener noreferrer">
                      Join Discord
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900/20">
                    <Github className="h-5 w-5 text-gray-800 dark:text-gray-200" />
                  </div>
                  <CardTitle className="mt-3">GitHub</CardTitle>
                  <CardDescription>
                    Platipus is open source. Submit issues, review PRs, or build new features.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href="https://github.com/platipus-speedruns/platipus"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View on GitHub
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/20">
                    <Zap className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="mt-3">Events</CardTitle>
                  <CardDescription>
                    Community races, marathons, and charity events happening on Platipus.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming soon
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-16 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">Community is growing</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Forums and events are coming soon. Follow the GitHub repository for updates.
              </p>
              <Button className="mt-6" asChild>
                <a
                  href="https://github.com/platipus-speedruns/platipus"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  Follow on GitHub
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
