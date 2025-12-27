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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { MONTH_NAMES } from "@/types";

interface MonthlyData {
  month: number;
  surplus_deficit: string;
}

interface SurplusDeficitChartProps {
  data: MonthlyData[];
  year: number;
  isLoading?: boolean;
}

export const SurplusDeficitChart = memo(function SurplusDeficitChart({ data, year, isLoading }: SurplusDeficitChartProps) {
  // Memoize chart data transformation
  const { chartData, yearlyTotal } = useMemo(() => {
    const processed = data.map((item) => ({
      name: MONTH_NAMES[item.month - 1].slice(0, 3),
      value: parseFloat(item.surplus_deficit) || 0,
    }));
    return { chartData: processed, yearlyTotal: processed.reduce((sum, item) => sum + item.value, 0) };
  }, [data]);

  if (isLoading) {
    return <ChartSkeleton height="h-64" />;
  }

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? "+" : "";
    return `${prefix}$${Math.abs(value).toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Monthly Surplus/Deficit - {year}</span>
          <span className={`text-lg ${yearlyTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(yearlyTotal)} YTD
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
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
            <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={2} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value >= 0 ? "#10b981" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
