import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn("hover-elevate", className)} data-testid="card-metric">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" data-testid="text-metric-value">
          {value}
        </div>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-status-done" : "text-status-critical"
          )}>
            {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
