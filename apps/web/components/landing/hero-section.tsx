"use client"

import { Button } from "@/components/ui/button"
import { Mic, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const greetings = [
  "Good morning",
  "Good afternoon", 
  "Good evening"
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return greetings[0]
  if (hour < 18) return greetings[1]
  return greetings[2]
}

export function HeroSection() {
  const [greeting, setGreeting] = useState("Welcome")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setGreeting(getGreeting())
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),transparent)]" />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground">
            <span className="flex h-2 w-2 rounded-full bg-primary" />
            AI-Powered Communication Coach
          </div>

          {/* Dynamic greeting */}
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {mounted ? greeting : "Welcome"}
            <span className="text-muted-foreground">,</span>
            <br />
            <span className="text-primary">Speak with confidence</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Master your communication skills with AI-powered mock interviews, real-time speech analysis, and personalized coaching. Land your dream job with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base bg-primary hover:bg-primary/90 gap-2">
                <Mic className="h-5 w-5" />
                Start Practice
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2">
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

        </div>

        {/* Hero visual */}
        <div className="relative mx-auto mt-20 max-w-4xl">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-primary/5">
            <div className="rounded-xl bg-muted/50 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Mock Interview Session</h3>
                  <p className="text-sm text-muted-foreground">Software Engineer - Technical Round</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-muted-foreground">Live</span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-background p-4 border border-border">
                  <div className="text-2xl font-semibold text-primary">87%</div>
                  <div className="text-sm text-muted-foreground">Confidence Score</div>
                </div>
                <div className="rounded-lg bg-background p-4 border border-border">
                  <div className="text-2xl font-semibold text-foreground">3</div>
                  <div className="text-sm text-muted-foreground">Filler Words</div>
                </div>
                <div className="rounded-lg bg-background p-4 border border-border">
                  <div className="text-2xl font-semibold text-foreground">2:34</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        </div>
      </div>
    </section>
  )
}
