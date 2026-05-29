const testimonials = [
  {
    quote: "The single biggest problem in communication is the illusion that it has taken place.",
    author: "George Bernard Shaw",
    role: "Playwright & Critic"
  },
  {
    quote: "Communication works for those who work at it. The more you practice, the better you become.",
    author: "John Powell",
    role: "Author"
  },
  {
    quote: "The art of communication is the language of leadership. Every great speaker was once a nervous beginner.",
    author: "James Humes",
    role: "Presidential Speechwriter"
  }
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Words on communication
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Timeless wisdom about the power of effective communication.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="flex flex-col rounded-2xl border border-border bg-card p-8"
            >
              <blockquote className="flex-1 text-foreground leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="font-semibold text-foreground">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
