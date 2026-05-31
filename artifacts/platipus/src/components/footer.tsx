import { Link } from "wouter"
import { Timer, Github, Twitter } from "lucide-react"

const footerLinks = {
  Platform: [
    { label: "Games", href: "/games" },
    { label: "Leaderboards", href: "/leaderboards" },
    { label: "Runners", href: "/runners" },
    { label: "Submit Run", href: "/submit" },
  ],
  Community: [
    { label: "Discord", href: "/discord" },
    { label: "Forums", href: "/forums" },
    { label: "Events", href: "/events" },
    { label: "Blog", href: "/blog" },
  ],
  Developers: [
    { label: "API Docs", href: "/docs/api" },
    { label: "GitHub", href: "https://github.com/platipus-speedruns/platipus" },
    { label: "Contribute", href: "/contribute" },
    { label: "Self-Host", href: "/docs/self-host" },
  ],
  Legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Guidelines", href: "/guidelines" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Timer className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Platipus</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The open source home for speedrunning. Free forever.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://github.com/platipus-speedruns/platipus"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/platipusruns"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => {
                  const isExternal = link.href.startsWith("http")
                  return (
                    <li key={link.label}>
                      {isExternal ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Platipus. Open source under MIT License.
          </p>
        </div>
      </div>
    </footer>
  )
}
