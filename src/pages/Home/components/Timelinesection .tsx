import steps from "@/constants/steps";

export function TimelineSection() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3">
        How it works
      </p>
      <h2 className="font-mono text-2xl font-bold tracking-tight mb-14">
        The zero-knowledge data flow
      </h2>

      {/* Desktop: horizontal stepper */}
      <div className="hidden md:flex items-start gap-0 relative">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className="flex-1 relative flex flex-col items-center text-center px-3"
          >
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="absolute top-[18px] left-[calc(50%+18px)] right-[calc(-50%+18px)] h-px bg-border z-0" />
            )}

            {/* Number bubble */}
            <div className="relative z-10 w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-mono text-xs font-bold mb-4 shrink-0">
              {step.number}
            </div>

            <p className="text-sm font-semibold mb-1.5 leading-snug">
              {step.label}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="flex flex-col gap-0 md:hidden">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-4">
            {/* Left: number + vertical line */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-mono text-xs font-bold shrink-0">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>

            {/* Right: content */}
            <div className="pb-8 pt-1">
              <p className="text-sm font-semibold mb-1">{step.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
