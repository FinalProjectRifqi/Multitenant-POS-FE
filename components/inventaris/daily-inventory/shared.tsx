import { TableCell, TableRow } from "@/components/ui/table";

export const INVENTORY_LIST_LIMIT = 100;

export const DAILY_INVENTORY_CARD_CLASS =
  "bg-primary-foreground shadow-sm ring-1 ring-border/90";

export const DAILY_INVENTORY_TABLE_FRAME_CLASS =
  "overflow-x-auto rounded-lg border border-border/80 bg-primary-foreground";

export const DAILY_INVENTORY_TABLE_HEADER_ROW_CLASS =
  "bg-muted/40 hover:bg-muted/40";

export function formatDailyInventoryDate(dateStr: string): string {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateStr + "T00:00:00"));
  } catch {
    return dateStr;
  }
}

export function TableSkeleton({
  cols,
  rows = 4,
}: {
  cols: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: cols }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-4 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
