import { Banner } from "@/components/banner"
import Feature from "@/components/feature"
import Feature2 from "@/components/feature2"
import Pricing from "@/components/pricing"
import CTA from "@/components/cta-section"

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden font-sans text-white">
      {/* Hero Banner Section */}
      <div className="relative z-10">
        <Banner />
      </div>

      {/* Feature Section */}
      <div className="relative z-10">
        <Feature />
        <Feature2 />
        <Pricing />
        <CTA />
      </div>
    </main>
  )
}
