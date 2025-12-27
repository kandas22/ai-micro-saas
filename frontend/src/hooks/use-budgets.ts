"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { budgetApi } from "@/lib/budgets";
import type {
  BudgetEntryCreate,
  BudgetEntryUpdate,
  CategoryType,
} from "@/types";

// Cache times in milliseconds
const STALE_TIME = 30 * 1000; // 30 seconds - data considered fresh
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes - keep in cache

interface BudgetFilters {
  month?: number;
  year?: number;
  category_id?: number;
  category_type?: CategoryType;
}

/**
 * Hook for fetching budget entries.
 */
export function useBudgets(filters?: BudgetFilters) {
  return useQuery({
    queryKey: ["budgets", filters],
    queryFn: () => budgetApi.getEntries(filters),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

/**
 * Hook for fetching a single budget entry.
 */
export function useBudget(id: number) {
  return useQuery({
    queryKey: ["budget", id],
    queryFn: () => budgetApi.getEntry(id),
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

/**
 * Hook for creating a budget entry.
 */
export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BudgetEntryCreate) => budgetApi.createEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Budget entry created");
    },
    onError: (error: Error) => {
      toast.error("Failed to create budget entry", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for updating a budget entry.
 */
export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetEntryUpdate }) =>
      budgetApi.updateEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budget", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to update budget", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for deleting a budget entry.
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => budgetApi.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Budget entry deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete budget entry", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for bulk creating/updating budgets.
 */
export function useBulkBudgets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entries: BudgetEntryCreate[]) => budgetApi.bulkCreateOrUpdate(entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      toast.success("Month initialized successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to initialize month", {
        description: error.message,
      });
    },
  });
}

/**
 * Hook for fetching monthly summary.
 */
export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: ["summary", "monthly", year, month],
    queryFn: () => budgetApi.getMonthlySummary(year, month),
    enabled: !!year && !!month,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

/**
 * Hook for fetching yearly summary.
 */
export function useYearlySummary(year: number) {
  return useQuery({
    queryKey: ["summary", "yearly", year],
    queryFn: () => budgetApi.getYearlySummary(year),
    enabled: !!year,
    staleTime: 60 * 1000, // 1 minute - yearly data changes less frequently
    gcTime: CACHE_TIME,
  });
}
