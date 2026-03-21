import { Card, CardContent } from "@/components/ui/card";
import algorithms from "@/constants/algorithms";


function StrengthDots({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex gap-1.5 mt-3">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 rounded-full transition-colors ${
            i < value ? "bg-blue-600" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

export function AlgorithmsSection() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20">
      <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3">
        Cryptographic primitives
      </p>
      <h2 className="font-mono text-2xl font-bold tracking-tight mb-12">
        The algorithms under the hood
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {algorithms.map((algo) => (
          <Card
            key={algo.name}
            className="border border-border/50 rounded-2xl shadow-none hover:border-border transition-colors duration-200"
          >
            <CardContent className="p-6 flex flex-col h-full">
              {/* Name + subtitle */}
              <div className="mb-4">
                <h3 className="font-mono text-base font-bold tracking-tight">
                  {algo.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {algo.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {algo.description}
              </p>

              {/* Detail line */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="font-mono text-[10px] text-muted-foreground tracking-wide">
                  {algo.detail}
                </p>
                <StrengthDots value={algo.strength} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
