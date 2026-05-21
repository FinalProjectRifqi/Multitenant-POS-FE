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
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

export function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
  return (
    <section
      className={`grid grid-cols-2 gap-4 ${COLUMN_CLASS[columns]}`}
    >
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="min-h-28 rounded-2xl border border-primary/20 bg-primary py-0 text-primary-foreground ring-0"
        >
          <CardContent className="flex h-full min-h-28 flex-col justify-between gap-3 px-4 py-5 sm:px-5">
            <p className="text-sm font-semibold leading-tight sm:text-base">
              {stat.label}
            </p>
            <p className="break-words text-2xl font-bold leading-tight sm:text-3xl">
              {stat.value}
            </p>
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
