import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Code2, Github, Server } from "lucide-react"

export default function Docs() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Documentation</h1>
              <p className="mt-3 text-lg text-muted-foreground">
                Everything you need to use, self-host, or contribute to Platipus.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="mt-3">Getting Started</CardTitle>
                  <CardDescription>
                    Learn how to submit runs, manage leaderboards, and use the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming soon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Code2 className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="mt-3">API Reference</CardTitle>
                  <CardDescription>
                    Integrate with the Platipus API to build tools and bots for speedrunners.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Coming soon
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Server className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="mt-3">Self-Hosting</CardTitle>
                  <CardDescription>
                    Run your own Platipus instance. Step-by-step guide for Docker or bare metal.
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Github className="h-5 w-5 text-orange-600" />
                  </div>
                  <CardTitle className="mt-3">Contributing</CardTitle>
                  <CardDescription>
                    Platipus is open source. Learn how to contribute code, report bugs, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href="https://github.com/platipus-speedruns/platipus"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contributing Guide
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
