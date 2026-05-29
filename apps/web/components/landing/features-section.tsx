import { Mic, BarChart3, Target, Brain, TrendingUp, MessageSquare } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Real-Time Interview Simulation",
    description: "Practice with AI-powered mock interviews tailored to your target role and industry."
  },
  {
    icon: BarChart3,
    title: "Speech Analysis & Feedback",
    description: "Get instant analysis of your speaking pace, tone, clarity, and overall delivery."
  },
  {
    icon: Target,
    title: "Filler Word Detection",
    description: "Identify and reduce filler words like 'um', 'uh', and 'like' with real-time tracking."
  },
  {
    icon: Brain,
    title: "Confidence Scoring",
    description: "Receive an AI-generated confidence score based on your speech patterns and delivery."
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Monitor your improvement over time with detailed analytics and trend insights."
  },
  {
    icon: MessageSquare,
    title: "Personalized Insights",
    description: "Get customized recommendations to improve your specific areas of weakness."
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything you need to speak with confidence
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful AI tools designed to help you master communication and ace every interview.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
