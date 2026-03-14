import { cn } from "@/lib/utils";

type Status = "draft" | "waiting" | "ready" | "done" | "cancelled";

const statusStyles: Record<Status, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  waiting: "bg-warning/10 text-warning border-warning/20",
  ready: "bg-secondary/10 text-secondary border-secondary/20",
  done: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}
