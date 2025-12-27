"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateGoal, useUpdateGoal } from "@/hooks/use-goals";
import type { SavingsGoal, GoalCreate, GoalUpdate } from "@/types";

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
  goal?: SavingsGoal | null;
}

export function GoalForm({ isOpen, onClose, goal }: GoalFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();

  const isEditing = !!goal;

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.target_amount);
      setCurrentAmount(goal.current_amount);
      setTargetDate(goal.target_date || "");
    } else {
      setName("");
      setTargetAmount("");
      setCurrentAmount("");
      setTargetDate("");
    }
    setError("");
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Goal name is required");
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError("Target amount must be a positive number");
      return;
    }

    const current = currentAmount ? parseFloat(currentAmount) : 0;
    if (isNaN(current) || current < 0) {
      setError("Current amount must be a non-negative number");
      return;
    }

    try {
      if (isEditing && goal) {
        const data: GoalUpdate = {
          name: name.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount || "0",
          target_date: targetDate || undefined,
        };
        await updateGoal.mutateAsync({ id: goal.id, data });
      } else {
        const data: GoalCreate = {
          name: name.trim(),
          target_amount: targetAmount,
          current_amount: currentAmount || "0",
          target_date: targetDate || undefined,
        };
        await createGoal.mutateAsync(data);
      }
      onClose();
    } catch (err) {
      setError("Failed to save goal. Please try again.");
      console.error(err);
    }
  };

  const isPending = createGoal.isPending || updateGoal.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Goal" : "Create New Goal"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Goal Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Emergency Fund"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <Input
                id="targetAmount"
                type="number"
                placeholder="10000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                disabled={isPending}
                min="0"
                step="0.01"
                className="pl-7"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentAmount">Current Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <Input
                id="currentAmount"
                type="number"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                disabled={isPending}
                min="0"
                step="0.01"
                className="pl-7"
              />
            </div>
            <p className="text-xs text-gray-500">
              How much have you already saved toward this goal?
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              disabled={isPending}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-gray-500">
              When do you want to achieve this goal?
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEditing ? "Update Goal" : "Create Goal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
