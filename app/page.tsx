import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { GamesSection } from "@/components/games-section"
import { LeaderboardPreview } from "@/components/leaderboard-preview"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <GamesSection />
        <LeaderboardPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
