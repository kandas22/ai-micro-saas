"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import type { SavingsGoal } from "@/types";

interface GoalProgressChartProps {
  goals: SavingsGoal[];
  isLoading?: boolean;
}

export function GoalProgressChart({ goals, isLoading }: GoalProgressChartProps) {
  if (isLoading) {
    return <ChartSkeleton height="h-64" />;
  }

  const activeGoals = goals.filter((g) => g.is_active);

  if (activeGoals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goals Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No active goals to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = activeGoals.map((goal) => ({
    name: goal.name.length > 15 ? goal.name.slice(0, 15) + "..." : goal.name,
    fullName: goal.name,
    current: parseFloat(goal.current_amount),
    remaining: Math.max(0, parseFloat(goal.remaining_amount)),
    target: parseFloat(goal.target_amount),
    progress: goal.progress_percentage,
  }));

  const totalTarget = chartData.reduce((sum, g) => sum + g.target, 0);
  const totalCurrent = chartData.reduce((sum, g) => sum + g.current, 0);
  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Goals Progress Overview</span>
          <span className="text-lg text-blue-600">
            {overallProgress.toFixed(1)}% Overall
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(240, activeGoals.length * 50)}>
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
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                    <p className="font-medium mb-2">{data.fullName}</p>
                    <p className="text-sm text-blue-600">
                      Current: {formatCurrency(data.current)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Remaining: {formatCurrency(data.remaining)}
                    </p>
                    <p className="text-sm text-green-600">
                      Target: {formatCurrency(data.target)}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      Progress: {data.progress.toFixed(1)}%
                    </p>
                  </div>
                );
              }}
            />
            <Legend />
            <Bar
              dataKey="current"
              stackId="a"
              name="Current"
              radius={[0, 0, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`current-${index}`}
                  fill={entry.progress >= 100 ? "#10b981" : "#3b82f6"}
                />
              ))}
            </Bar>
            <Bar
              dataKey="remaining"
              stackId="a"
              name="Remaining"
              fill="#e5e7eb"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
