import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "circular" | "rounded";
}

function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200",
        {
          "rounded-md": variant === "default",
          "rounded-full": variant === "circular",
          "rounded-lg": variant === "rounded",
        },
        className
      )}
      {...props}
    />
  );
}

/**
 * Skeleton for a card layout with title and content.
 */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border bg-white p-6 space-y-4", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

/**
 * Skeleton for chart components.
 */
function ChartSkeleton({ className, height = "h-80" }: { className?: string; height?: string }) {
  return (
    <div className={cn("rounded-lg border bg-white overflow-hidden", className)}>
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="p-4">
        <Skeleton className={cn(height, "w-full rounded-lg")} />
      </div>
    </div>
  );
}

/**
 * Skeleton for table rows.
 */
function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={cn("h-4", i === 0 ? "w-32" : "w-20")} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Skeleton for budget table section.
 */
function BudgetTableSkeleton() {
  return (
    <div className="rounded-lg border bg-gray-50 overflow-hidden">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-white/50">
              <th className="px-4 py-2"><Skeleton className="h-4 w-20" /></th>
              <th className="px-4 py-2"><Skeleton className="h-4 w-16 ml-auto" /></th>
              <th className="px-4 py-2"><Skeleton className="h-4 w-16 ml-auto" /></th>
              <th className="px-4 py-2"><Skeleton className="h-4 w-12 ml-auto" /></th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <TableRowSkeleton key={i} columns={4} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Skeleton for goal cards.
 */
function GoalCardSkeleton() {
  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  CardSkeleton,
  ChartSkeleton,
  TableRowSkeleton,
  BudgetTableSkeleton,
  GoalCardSkeleton
};
