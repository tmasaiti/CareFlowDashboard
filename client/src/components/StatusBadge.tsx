import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/db";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TaskStatus | 'Active' | 'Discharged' | 'On-hold';
  className?: string;
}

const statusConfig = {
  done: { bg: "bg-status-done/15", text: "text-status-done", label: "Done" },
  pending: { bg: "bg-status-pending/15", text: "text-status-pending", label: "Pending" },
  onhold: { bg: "bg-status-onhold/15", text: "text-status-onhold", label: "On Hold" },
  critical: { bg: "bg-status-critical/15", text: "text-status-critical", label: "Critical" },
  missed: { bg: "bg-status-missed/15", text: "text-status-missed", label: "Missed" },
  arrived: { bg: "bg-status-arrived/15", text: "text-status-arrived", label: "Arrived" },
  Active: { bg: "bg-status-done/15", text: "text-status-done", label: "Active" },
  'On-hold': { bg: "bg-status-onhold/15", text: "text-status-onhold", label: "On Hold" },
  Discharged: { bg: "bg-status-discharged/15", text: "text-status-discharged", label: "Discharged" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-semibold uppercase border-0",
        config.bg,
        config.text,
        className
      )}
      data-testid={`badge-status-${status.toLowerCase()}`}
    >
      {config.label}
    </Badge>
  );
}
