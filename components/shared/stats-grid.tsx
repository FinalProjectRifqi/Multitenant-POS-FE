import { Card, CardContent } from "@/components/ui/card";

export type StatItem = {
  label: string;
  value: number | string;
  description?: string;
};

type StatsGridProps = {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
};

const COLUMN_CLASS: Record<NonNullable<StatsGridProps["columns"]>, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  return (
    <section className={`grid grid-cols-1 gap-4 ${COLUMN_CLASS[columns]}`}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border border-primary/20 bg-primary py-0 text-primary-foreground ring-0"
        >
          <CardContent className="space-y-2 px-4 py-3">
            <p className="text-xl font-semibold leading-none">{stat.label}</p>
            <p className="text-2xl font-bold leading-none">{stat.value}</p>
            {stat.description && (
              <p className="text-xs text-primary-foreground/80">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
