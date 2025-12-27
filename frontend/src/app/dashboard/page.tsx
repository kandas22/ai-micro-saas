"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/hooks/use-auth";
import { useMonthlySummary, useYearlySummary } from "@/hooks/use-budgets";
import { useBudgetExport, useYearlySummaryExport } from "@/hooks/use-exports";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/ExportMenu";
import { Header } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { MONTH_NAMES } from "@/types";

// Lazy load chart components to reduce initial bundle size
const MonthlyTrendChart = dynamic(
  () => import("@/components/charts/MonthlyTrendChart").then((mod) => mod.MonthlyTrendChart),
  {
    loading: () => (
      <Card>
        <CardHeader><CardTitle>Monthly Trends</CardTitle></CardHeader>
        <CardContent><div className="h-80 bg-gray-100 rounded animate-pulse" /></CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const CategoryPieChart = dynamic(
  () => import("@/components/charts/CategoryPieChart").then((mod) => mod.CategoryPieChart),
  {
    loading: () => (
      <Card>
        <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
        <CardContent><div className="h-64 bg-gray-100 rounded animate-pulse" /></CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const ExpenseBreakdownChart = dynamic(
  () => import("@/components/charts/ExpenseBreakdownChart").then((mod) => mod.ExpenseBreakdownChart),
  {
    loading: () => (
      <Card>
        <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
        <CardContent><div className="h-64 bg-gray-100 rounded animate-pulse" /></CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const SurplusDeficitChart = dynamic(
  () => import("@/components/charts/SurplusDeficitChart").then((mod) => mod.SurplusDeficitChart),
  {
    loading: () => (
      <Card>
        <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
        <CardContent><div className="h-80 bg-gray-100 rounded animate-pulse" /></CardContent>
      </Card>
    ),
    ssr: false,
  }
);

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Get current month/year data
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: summary, isLoading: summaryLoading } = useMonthlySummary(year, month);
  const { data: yearlySummary, isLoading: yearlyLoading } = useYearlySummary(year);

  // Export
  const { exportCsv: exportBudgetCsv, exportExcel: exportBudgetExcel, exportPdf: exportBudgetPdf, isExporting: isBudgetExporting } = useBudgetExport();
  const { exportCsv: exportYearlyCsv, isExporting: isYearlyExporting } = useYearlySummaryExport();

  // Memoized computed values to prevent unnecessary recalculations
  const { surplusDeficit, isPositive, hasData } = useMemo(() => {
    const surplus = parseFloat(summary?.surplus_deficit || "0");
    const positive = surplus >= 0;
    const data = summary && (
      parseFloat(summary.total_income) > 0 ||
      parseFloat(summary.total_expenses) > 0 ||
      parseFloat(summary.total_savings) > 0
    );
    return { surplusDeficit: surplus, isPositive: positive, hasData: data };
  }, [summary]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.full_name || user.email} onLogout={logout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-sm sm:text-base text-gray-600">
              {MONTH_NAMES[month - 1]} {year} - Your financial overview
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ExportMenu
              onExportCsv={() => exportBudgetCsv(year, month)}
              onExportExcel={() => exportBudgetExcel(year, month)}
              onExportPdf={() => exportBudgetPdf(year, month)}
              isExporting={isBudgetExporting}
              label="Export Month"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportYearlyCsv(year)}
              disabled={isYearlyExporting}
              className="text-xs sm:text-sm"
            >
              {isYearlyExporting ? "..." : `${year} Summary`}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Income</CardDescription>
              <CardTitle className="text-lg sm:text-2xl text-green-600">
                {summaryLoading ? "..." : formatCurrency(summary?.total_income)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Expenses</CardDescription>
              <CardTitle className="text-lg sm:text-2xl text-red-600">
                {summaryLoading ? "..." : formatCurrency(summary?.total_expenses)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Savings</CardDescription>
              <CardTitle className="text-lg sm:text-2xl text-blue-600">
                {summaryLoading ? "..." : formatCurrency(summary?.total_savings)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Surplus/Deficit</CardDescription>
              <CardTitle className={`text-lg sm:text-2xl ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {summaryLoading ? "..." : (
                  <>
                    {isPositive ? "+" : "-"}
                    {formatCurrency(Math.abs(surplusDeficit))}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">
                {isPositive ? "Remaining" : "Over budget"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {hasData ? (
          <>
            {/* Yearly Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <MonthlyTrendChart
                data={yearlySummary?.monthly_breakdown || []}
                year={year}
                isLoading={yearlyLoading}
              />
              <SurplusDeficitChart
                data={yearlySummary?.monthly_breakdown || []}
                year={year}
                isLoading={yearlyLoading}
              />
            </div>

            {/* Category Breakdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <CategoryPieChart
                data={summary?.income_breakdown || []}
                title="Income Sources"
                type="income"
                isLoading={summaryLoading}
              />
              <CategoryPieChart
                data={summary?.savings_breakdown || []}
                title="Savings Allocation"
                type="savings"
                isLoading={summaryLoading}
              />
              <ExpenseBreakdownChart
                data={summary?.expense_breakdown || []}
                isLoading={summaryLoading}
              />
            </div>

            {/* Expense Categories Pie */}
            <div className="mb-6 sm:mb-8">
              <CategoryPieChart
                data={summary?.expense_breakdown || []}
                title="Expense Categories"
                type="expense"
                isLoading={summaryLoading}
              />
            </div>
          </>
        ) : (
          /* Getting Started - Show when no data */
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Getting Started</CardTitle>
              <CardDescription>
                Welcome to your Financial Budget Tracker!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Start tracking your finances to see charts and insights here.
              </p>
              <ol className="list-decimal list-inside text-sm sm:text-base text-gray-600 space-y-2 mb-6">
                <li>Go to the <Link href="/budget" className="text-blue-600 hover:underline">Budget page</Link></li>
                <li>Click &quot;Initialize Month&quot; to set up categories</li>
                <li>Enter your budgeted and actual amounts</li>
                <li>Come back here to see your overview</li>
              </ol>
              <Link href="/budget">
                <Button>Get Started</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Monthly Budget</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Track income, expenses, and savings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <Link href="/budget">
                <Button className="w-full">Manage Budget</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Savings Goals</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Set and track your financial goals
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <Link href="/goals">
                <Button variant="outline" className="w-full">
                  Manage Goals
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
