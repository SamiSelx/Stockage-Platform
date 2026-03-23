import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import features from "@/constants/features";


export function FeaturesSection() {
  return (
    <section className="mt-0 max-w-7xl mx-auto px-6 ">
      <p className="text-xs font-mono tracking-[0.2em] uppercase text-muted-foreground mb-3">
        Features
      </p>
      <h2 className="font-mono text-2xl font-bold tracking-tight mb-12">
        Everything you need to store files privately
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="border border-border/50 rounded-2xl shadow-none hover:shadow-sm transition-shadow duration-200"
            >
              <CardContent className="p-6 flex flex-col gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${feature.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>

                <h3 className="text-sm font-semibold leading-snug">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>

                <div className="pt-1">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${feature.tagBg} border-0`}
                  >
                    {feature.tag}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
