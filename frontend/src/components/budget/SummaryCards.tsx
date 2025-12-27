"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CardSkeleton } from "@/components/ui/skeleton";
import type { MonthlySummary } from "@/types";

interface SummaryCardsProps {
  summary: MonthlySummary | undefined;
  isLoading: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const formatCurrency = (value: string | undefined) => {
    if (!value) return "$0.00";
    const num = parseFloat(value);
    return isNaN(num) ? "$0.00" : `$${Math.abs(num).toFixed(2)}`;
  };

  const surplusDeficit = parseFloat(summary?.surplus_deficit || "0");
  const isPositive = surplusDeficit >= 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Income</CardDescription>
          <CardTitle className="text-2xl text-green-600">
            {formatCurrency(summary?.total_income)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            From {summary?.income_breakdown?.length || 0} sources
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Expenses</CardDescription>
          <CardTitle className="text-2xl text-red-600">
            {formatCurrency(summary?.total_expenses)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            Across {summary?.expense_breakdown?.length || 0} categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Savings</CardDescription>
          <CardTitle className="text-2xl text-blue-600">
            {formatCurrency(summary?.total_savings)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            In {summary?.savings_breakdown?.length || 0} accounts
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Surplus/Deficit</CardDescription>
          <CardTitle
            className={`text-2xl ${isPositive ? "text-green-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : "-"}
            {formatCurrency(summary?.surplus_deficit)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500">
            {isPositive ? "Money remaining" : "Over budget"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
