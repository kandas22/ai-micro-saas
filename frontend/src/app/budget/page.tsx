"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useBudgets, useUpdateBudget, useMonthlySummary, useBulkBudgets } from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { useBudgetExport } from "@/hooks/use-exports";
import { Button } from "@/components/ui/button";
import { BudgetTable } from "@/components/budget/BudgetTable";
import { MonthSelector } from "@/components/budget/MonthSelector";
import { SummaryCards } from "@/components/budget/SummaryCards";
import { ExportMenu } from "@/components/ExportMenu";
import { Header } from "@/components/layout";

export default function BudgetPage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Get current month/year
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // Fetch data
  const { data: budgetData, isLoading: budgetsLoading } = useBudgets({ year, month });
  const { data: categoryData, isLoading: categoriesLoading } = useCategories();
  const { data: summaryData, isLoading: summaryLoading } = useMonthlySummary(year, month);

  // Mutations
  const updateBudget = useUpdateBudget();
  const bulkBudgets = useBulkBudgets();

  // Export
  const { exportCsv, exportExcel, isExporting } = useBudgetExport();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize entries for all categories
  const handleInitializeMonth = async () => {
    if (!categoryData?.categories) return;

    const entries = categoryData.categories
      .filter((cat) => cat.is_active)
      .map((cat) => ({
        category_id: cat.id,
        month,
        year,
        budgeted_amount: "0.00",
        actual_amount: "0.00",
      }));

    await bulkBudgets.mutateAsync(entries);
  };

  // Update budget entry
  const handleUpdate = (
    id: number,
    field: "budgeted_amount" | "actual_amount",
    value: string
  ) => {
    updateBudget.mutate({
      id,
      data: { [field]: value },
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isLoading = budgetsLoading || categoriesLoading;
  const entries = budgetData?.entries || [];
  const categories = categoryData?.categories || [];
  const hasEntries = entries.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.full_name || user.email} onLogout={logout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Budget</h2>
              <p className="text-sm sm:text-base text-gray-600">
                Track your income, expenses, and savings
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <ExportMenu
                onExportCsv={() => exportCsv(year, month)}
                onExportExcel={() => exportExcel(year, month)}
                isExporting={isExporting}
              />
              <MonthSelector
                year={year}
                month={month}
                onYearChange={setYear}
                onMonthChange={setMonth}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-4 sm:mb-8">
          <SummaryCards summary={summaryData} isLoading={summaryLoading} />
        </div>

        {/* Initialize Button */}
        {!hasEntries && !isLoading && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-white rounded-lg border text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2">No budget entries for this month</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Initialize budget entries to start tracking.
            </p>
            <Button
              onClick={handleInitializeMonth}
              disabled={bulkBudgets.isPending}
            >
              {bulkBudgets.isPending ? "Initializing..." : "Initialize Month"}
            </Button>
          </div>
        )}

        {/* Budget Tables */}
        {isLoading ? (
          <div className="space-y-4 sm:space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 sm:h-48 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Income Table */}
            <BudgetTable
              entries={entries.filter((e) => e.category?.category_type === "income")}
              categories={categories}
              categoryType="income"
              onUpdate={handleUpdate}
              isLoading={updateBudget.isPending}
            />

            {/* Savings Table */}
            <BudgetTable
              entries={entries.filter((e) => e.category?.category_type === "savings")}
              categories={categories}
              categoryType="savings"
              onUpdate={handleUpdate}
              isLoading={updateBudget.isPending}
            />

            {/* Expenses Table */}
            <BudgetTable
              entries={entries.filter((e) => e.category?.category_type === "expense")}
              categories={categories}
              categoryType="expense"
              onUpdate={handleUpdate}
              isLoading={updateBudget.isPending}
            />
          </div>
        )}
      </main>
    </div>
  );
}
