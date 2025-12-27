"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useUpdateGoalProgress, useDeleteGoal, useUpdateGoal } from "@/hooks/use-goals";
import type { SavingsGoal } from "@/types";

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: (goal: SavingsGoal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  const updateProgress = useUpdateGoalProgress();
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? "$0.00" : `$${num.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysRemaining = () => {
    if (!goal.target_date) return null;
    const target = new Date(goal.target_date);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isCompleted = goal.progress_percentage >= 100;
  const isOverdue = daysRemaining !== null && daysRemaining < 0 && !isCompleted;

  const handleAddFunds = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await updateProgress.mutateAsync({ id: goal.id, amount });
      setFundAmount("");
      setIsAddingFunds(false);
    } catch (error) {
      console.error("Failed to add funds:", error);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await updateProgress.mutateAsync({ id: goal.id, amount: -amount });
      setFundAmount("");
      setIsAddingFunds(false);
    } catch (error) {
      console.error("Failed to withdraw funds:", error);
    }
  };

  const handleToggleActive = async () => {
    try {
      await updateGoal.mutateAsync({
        id: goal.id,
        data: { is_active: !goal.is_active },
      });
    } catch (error) {
      console.error("Failed to toggle goal:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await deleteGoal.mutateAsync(goal.id);
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  return (
    <Card className={`relative ${!goal.is_active ? "opacity-60" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {goal.name}
              {isCompleted && (
                <Badge variant="default" className="bg-green-500">
                  Completed
                </Badge>
              )}
              {isOverdue && (
                <Badge variant="destructive">
                  Overdue
                </Badge>
              )}
              {!goal.is_active && (
                <Badge variant="secondary">
                  Inactive
                </Badge>
              )}
            </CardTitle>
            {goal.target_date && (
              <p className="text-sm text-gray-500 mt-1">
                Target: {formatDate(goal.target_date)}
                {daysRemaining !== null && daysRemaining > 0 && (
                  <span className="ml-2">({daysRemaining} days left)</span>
                )}
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              className="h-8 w-8 p-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleActive}
              className="h-8 w-8 p-0"
            >
              {goal.is_active ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Section */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {goal.progress_percentage.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={Math.min(goal.progress_percentage, 100)}
              className="h-3"
            />
          </div>

          {/* Amount Details */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500">Current</p>
              <p className="font-semibold text-blue-600">
                {formatCurrency(goal.current_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Remaining</p>
              <p className="font-semibold text-orange-600">
                {formatCurrency(goal.remaining_amount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Target</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          {/* Add Funds Section */}
          {goal.is_active && !isCompleted && (
            <div className="pt-2 border-t">
              {isAddingFunds ? (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleAddFunds}
                      disabled={updateProgress.isPending}
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleWithdraw}
                      disabled={updateProgress.isPending}
                    >
                      Withdraw
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingFunds(false);
                        setFundAmount("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingFunds(true)}
                >
                  Add Funds
                </Button>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="pt-2 border-t text-center">
              <p className="text-green-600 font-medium">
                Goal Achieved!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
