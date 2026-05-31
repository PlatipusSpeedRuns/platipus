"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Timer, Github, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
          <Link href="/games" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Games
          </Link>
          <Link href="/leaderboards" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Leaderboards
          </Link>
          <Link href="/community" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Community
          </Link>
          <Link href="/docs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
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
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Sign up</Link>
          </Button>
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
            <Link href="/games" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Games
            </Link>
            <Link href="/leaderboards" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Leaderboards
            </Link>
            <Link href="/community" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Community
            </Link>
            <Link href="/docs" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Docs
            </Link>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild className="w-full">
                <Link href="/signup">Sign up</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
