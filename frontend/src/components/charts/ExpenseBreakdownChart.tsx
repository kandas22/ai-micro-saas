"use client";

import { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { EXPENSE_TYPE_LABELS, type ExpenseType } from "@/types";

interface ExpenseData {
  category_id: number;
  category_name: string;
  expense_type?: string;
  budgeted: string;
  actual: string;
}

interface ExpenseBreakdownChartProps {
  data: ExpenseData[];
  isLoading?: boolean;
}

const EXPENSE_COLORS: Record<string, string> = {
  debt_loan: "#ef4444",
  insurance: "#f97316",
  fixed: "#eab308",
  recurring: "#84cc16",
  medical: "#06b6d4",
  discretionary: "#8b5cf6",
};

export const ExpenseBreakdownChart = memo(function ExpenseBreakdownChart({ data, isLoading }: ExpenseBreakdownChartProps) {
  // Memoize chart data transformation
  const { chartData, total } = useMemo(() => {
    const groupedData = data.reduce((acc, item) => {
      const type = item.expense_type || "other";
      const value = parseFloat(item.actual) || parseFloat(item.budgeted) || 0;
      if (!acc[type]) acc[type] = 0;
      acc[type] += value;
      return acc;
    }, {} as Record<string, number>);

    const processed = Object.entries(groupedData)
      .map(([type, value]) => ({
        name: EXPENSE_TYPE_LABELS[type as ExpenseType] || type,
        type,
        value,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return { chartData: processed, total: processed.reduce((sum, item) => sum + item.value, 0) };
  }, [data]);

  if (isLoading) {
    return <ChartSkeleton height="h-64" />;
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No expense data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Expense Breakdown by Type</span>
          <span className="text-lg text-red-600">{formatCurrency(total)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrencyCompact(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              width={90}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EXPENSE_COLORS[entry.type] || "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
