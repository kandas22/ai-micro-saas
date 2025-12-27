"use client";

import { memo, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";

interface CategoryData {
  category_id: number;
  category_name: string;
  budgeted: string;
  actual: string;
  expense_type?: string;
}

interface CategoryPieChartProps {
  data: CategoryData[];
  title: string;
  type: "income" | "expense" | "savings";
  isLoading?: boolean;
}

const COLORS = {
  income: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"],
  expense: ["#ef4444", "#f87171", "#fca5a5", "#fecaca", "#fee2e2", "#fef2f2"],
  savings: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
};

export const CategoryPieChart = memo(function CategoryPieChart({ data, title, type, isLoading }: CategoryPieChartProps) {
  // Memoize chart data transformation
  const { chartData, total } = useMemo(() => {
    const processed = data
      .map((item) => ({
        name: item.category_name,
        value: parseFloat(item.actual) || parseFloat(item.budgeted) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return { chartData: processed, total: processed.reduce((sum, item) => sum + item.value, 0) };
  }, [data]);

  if (isLoading) {
    return <ChartSkeleton height="h-64" />;
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const colors = COLORS[type];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{title}</span>
          <span className={`text-lg ${
            type === "income" ? "text-green-600" :
            type === "expense" ? "text-red-600" :
            "text-blue-600"
          }`}>
            {formatCurrency(total)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              formatter={(value: string) => (
                <span className="text-sm text-gray-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
