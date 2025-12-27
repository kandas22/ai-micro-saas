"use client";

import { memo, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { MONTH_NAMES } from "@/types";

interface MonthlyData {
  month: number;
  total_income: string;
  total_expenses: string;
  total_savings: string;
  surplus_deficit: string;
}

interface MonthlyTrendChartProps {
  data: MonthlyData[];
  year: number;
  isLoading?: boolean;
}

export const MonthlyTrendChart = memo(function MonthlyTrendChart({ data, year, isLoading }: MonthlyTrendChartProps) {
  if (isLoading) {
    return <ChartSkeleton height="h-80" />;
  }

  // Memoize chart data transformation
  const chartData = useMemo(() => data.map((item) => ({
    name: MONTH_NAMES[item.month - 1].slice(0, 3),
    month: item.month,
    income: parseFloat(item.total_income) || 0,
    expenses: parseFloat(item.total_expenses) || 0,
    savings: parseFloat(item.total_savings) || 0,
    surplus: parseFloat(item.surplus_deficit) || 0,
  })), [data]);

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends - {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
