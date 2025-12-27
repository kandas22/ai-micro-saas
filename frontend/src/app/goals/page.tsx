"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useGoals } from "@/hooks/use-goals";
import { useGoalsExport } from "@/hooks/use-exports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalCard, GoalForm, GoalProgressChart } from "@/components/goals";
import { ExportMenu } from "@/components/ExportMenu";
import { Header } from "@/components/layout";
import { formatCurrency } from "@/lib/utils";
import type { SavingsGoal } from "@/types";

export default function GoalsPage() {
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  const { data, isLoading: goalsLoading } = useGoals({ include_inactive: showInactive });

  // Export
  const { exportCsv, exportExcel, isExporting } = useGoalsExport();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

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

  const goals = data?.goals || [];
  const activeGoals = goals.filter((g) => g.is_active);
  const inactiveGoals = goals.filter((g) => !g.is_active);

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const totalTarget = goals
    .filter((g) => g.is_active)
    .reduce((sum, g) => sum + parseFloat(g.target_amount), 0);
  const totalCurrent = goals
    .filter((g) => g.is_active)
    .reduce((sum, g) => sum + parseFloat(g.current_amount), 0);
  const completedCount = activeGoals.filter((g) => g.progress_percentage >= 100).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={user.full_name || user.email} onLogout={logout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Savings Goals</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Track and manage your financial goals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ExportMenu
              onExportCsv={() => exportCsv(true)}
              onExportExcel={() => exportExcel(true)}
              isExporting={isExporting}
            />
            <Button onClick={() => setIsFormOpen(true)} className="flex-1 sm:flex-none">
              + New Goal
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Goals</CardDescription>
              <CardTitle className="text-lg sm:text-2xl">{activeGoals.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">Active goals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Completed</CardDescription>
              <CardTitle className="text-lg sm:text-2xl text-green-600">{completedCount}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">Goals achieved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Saved</CardDescription>
              <CardTitle className="text-lg sm:text-2xl text-blue-600 truncate">
                {formatCurrency(totalCurrent)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">Across all goals</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 sm:pb-2 p-3 sm:p-6">
              <CardDescription className="text-xs sm:text-sm">Total Target</CardDescription>
              <CardTitle className="text-lg sm:text-2xl text-purple-600 truncate">
                {formatCurrency(totalTarget)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs text-gray-500">Goal targets</p>
            </CardContent>
          </Card>
        </div>

        {goalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="h-32 sm:h-40 bg-gray-100 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals.length === 0 ? (
          /* Getting Started */
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Create Your First Goal</CardTitle>
              <CardDescription>
                Start tracking your financial goals
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Savings goals help you stay motivated and track progress.
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-1 mb-6">
                <li>Emergency fund (3-6 months)</li>
                <li>Vacation savings</li>
                <li>Down payment for a house</li>
                <li>Retirement contributions</li>
              </ul>
              <Button onClick={() => setIsFormOpen(true)}>
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Progress Chart - Hide on very small screens */}
            <div className="mb-6 sm:mb-8 hidden sm:block">
              <GoalProgressChart goals={goals} isLoading={goalsLoading} />
            </div>

            {/* Active Goals Grid */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Active Goals</h3>
              {activeGoals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {activeGoals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6 sm:py-8 text-center text-gray-500 text-sm sm:text-base">
                    No active goals. Create one to get started!
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Inactive Goals Section */}
            {inactiveGoals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Inactive Goals</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                  >
                    {showInactive ? "Hide" : "Show"} ({inactiveGoals.length})
                  </Button>
                </div>
                {showInactive && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {inactiveGoals.map((goal) => (
                      <GoalCard key={goal.id} goal={goal} onEdit={handleEdit} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Goal Form Dialog */}
      <GoalForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        goal={editingGoal}
      />
    </div>
  );
}
