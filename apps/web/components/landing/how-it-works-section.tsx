import { Mic, BarChart2, Sparkles } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Mic,
    title: "Start a Practice Session",
    description: "Choose your interview type, industry, and difficulty level. Our AI will generate relevant questions tailored to your goals."
  },
  {
    step: "02",
    icon: BarChart2,
    title: "Speak Naturally",
    description: "Answer questions as you would in a real interview. Our AI analyzes your speech in real-time, tracking pace, filler words, and confidence."
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Get Instant Feedback",
    description: "Receive detailed analysis with actionable insights. Track your progress over time and focus on areas that need improvement."
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps to transform your communication skills.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="absolute top-24 left-1/2 hidden h-0.5 w-[calc(100%-200px)] -translate-x-1/2 bg-border lg:block" />
          
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative text-center">
                {/* Step number */}
                <div className="relative mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-background text-sm font-semibold text-primary">
                  {item.step}
                </div>
                
                {/* Icon */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
