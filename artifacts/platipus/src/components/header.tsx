import { Link, useLocation } from "wouter"
import { Button } from "@/components/ui/button"
import { Timer, Github, Menu, X, LogOut, User, LayoutDashboard } from "lucide-react"
import { useState } from "react"
import { Show, useClerk, useUser } from "@clerk/react"

function UserMenu() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [open, setOpen] = useState(false)
  const [, setLocation] = useLocation()

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {user.imageUrl ? (
          <img src={user.imageUrl} alt={user.firstName ?? "User"} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-50 min-w-[200px] rounded-lg border border-border bg-card p-1 shadow-md">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-sm font-medium text-foreground truncate">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.username ?? user.emailAddresses[0]?.emailAddress ?? "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <button
            onClick={() => {
              setOpen(false)
              signOut({ redirectUrl: "/" })
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [location] = useLocation()

  function navClass(href: string) {
    const active = location === href || location.startsWith(href + "/")
    return `text-sm font-medium transition-colors hover:text-foreground ${active ? "text-foreground" : "text-muted-foreground"}`
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Timer className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Platipus</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/games" className={navClass("/games")}>
            Games
          </Link>
          <Link href="/leaderboards" className={navClass("/leaderboards")}>
            Leaderboards
          </Link>
          <Link href="/community" className={navClass("/community")}>
            Community
          </Link>
          <Link href="/docs" className={navClass("/docs")}>
            Docs
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <a href="https://github.com/platipus-speedruns/platipus" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </a>
          </Button>
          <Show when="signed-out">
            <Button variant="outline" size="sm" asChild>
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </Show>
          <Show when="signed-in">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <UserMenu />
          </Show>
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/games" className={navClass("/games")} onClick={() => setMobileMenuOpen(false)}>
              Games
            </Link>
            <Link href="/leaderboards" className={navClass("/leaderboards")} onClick={() => setMobileMenuOpen(false)}>
              Leaderboards
            </Link>
            <Link href="/community" className={navClass("/community")} onClick={() => setMobileMenuOpen(false)}>
              Community
            </Link>
            <Link href="/docs" className={navClass("/docs")} onClick={() => setMobileMenuOpen(false)}>
              Docs
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <Show when="signed-out">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                </Button>
                <Button size="sm" asChild className="w-full">
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
                </Button>
              </Show>
              <Show when="signed-in">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </Button>
                <UserMenu />
              </Show>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
