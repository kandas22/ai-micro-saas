"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { goalsApi } from "@/lib/goals";
import type { GoalCreate, GoalUpdate } from "@/types";

// Cache times in milliseconds
const STALE_TIME = 30 * 1000; // 30 seconds
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

interface GoalFilters {
  include_inactive?: boolean;
}

/**
 * Hook for fetching all savings goals.
 */
export function useGoals(filters?: GoalFilters) {
  return useQuery({
    queryKey: ["goals", filters],
    queryFn: () => goalsApi.getGoals(filters),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

/**
 * Hook for fetching a single goal.
 */
export function useGoal(id: number) {
  return useQuery({
    queryKey: ["goal", id],
    queryFn: () => goalsApi.getGoal(id),
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

/**
 * Hook for creating a savings goal.
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GoalCreate) => goalsApi.createGoal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create goal", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for updating a savings goal.
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GoalUpdate }) =>
      goalsApi.updateGoal(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.id] });
      toast.success("Goal updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update goal", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for deleting a savings goal.
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => goalsApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete goal", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for updating goal progress.
 */
export function useUpdateGoalProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) =>
      goalsApi.updateProgress(id, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal", variables.id] });
      toast.success("Progress updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update progress", {
        description: error.message,
      });
    },
  });
}
