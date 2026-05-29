import { Button } from "@/components/ui/button"
import { Mic, ArrowRight } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center sm:px-16">
          {/* Background pattern */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15),transparent_70%)]" />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to speak with confidence?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            Start your journey to better communication skills with SpeakEZ today.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base bg-white text-primary hover:bg-white/90 gap-2">
                <Mic className="h-5 w-5" />
                Start Practice Free
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button 
                size="lg" 
                className="h-12 px-8 text-base bg-white/20 text-white border border-white/40 hover:bg-white/30 gap-2"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
