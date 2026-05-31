import { Link } from "wouter"
import { Timer, Github, Twitter } from "lucide-react"

const footerLinks = {
  Platform: [
    { label: "Games", href: "/games" },
    { label: "Leaderboards", href: "/leaderboards" },
    { label: "Submit Run", href: "/submit" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Community: [
    { label: "Community", href: "/community" },
    { label: "Discord", href: "https://discord.gg/platipus", external: true },
    { label: "Events", href: "/community" },
    { label: "GitHub", href: "https://github.com/platipus-speedruns/platipus", external: true },
  ],
  Developers: [
    { label: "Docs", href: "/docs" },
    { label: "API Docs", href: "/docs" },
    { label: "Contribute", href: "https://github.com/platipus-speedruns/platipus", external: true },
    { label: "Self-Host", href: "/docs" },
  ],
  Legal: [
    { label: "Privacy", href: "/docs" },
    { label: "Terms", href: "/docs" },
    { label: "Guidelines", href: "/docs" },
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
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
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
                ))}
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
