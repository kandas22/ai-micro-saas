"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "@/lib/categories";
import type { CategoryType } from "@/types";

// Categories rarely change, so we can use longer cache times
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

interface CategoryFilters {
  type?: CategoryType;
  include_inactive?: boolean;
}

/**
 * Hook for fetching categories.
 */
export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: () => categoryApi.getCategories(filters),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}

/**
 * Hook for fetching a single category.
 */
export function useCategory(id: number) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryApi.getCategory(id),
    enabled: !!id,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
}
