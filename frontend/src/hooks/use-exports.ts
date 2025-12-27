"use client";

import { useState } from "react";
import { exportApi } from "@/lib/exports";

interface UseExportOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for budget exports.
 */
export function useBudgetExport(options?: UseExportOptions) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (year: number, month?: number) => {
    setIsExporting(true);
    try {
      await exportApi.exportBudgetsCsv({ year, month });
      options?.onSuccess?.();
    } catch (error) {
      console.error("Export failed:", error);
      options?.onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = async (year: number, month?: number) => {
    setIsExporting(true);
    try {
      await exportApi.exportBudgetsExcel({ year, month });
      options?.onSuccess?.();
    } catch (error) {
      console.error("Export failed:", error);
      options?.onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, exportExcel, isExporting };
}

/**
 * Hook for goals exports.
 */
export function useGoalsExport(options?: UseExportOptions) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (includeInactive = true) => {
    setIsExporting(true);
    try {
      await exportApi.exportGoalsCsv({ include_inactive: includeInactive });
      options?.onSuccess?.();
    } catch (error) {
      console.error("Export failed:", error);
      options?.onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = async (includeInactive = true) => {
    setIsExporting(true);
    try {
      await exportApi.exportGoalsExcel({ include_inactive: includeInactive });
      options?.onSuccess?.();
    } catch (error) {
      console.error("Export failed:", error);
      options?.onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, exportExcel, isExporting };
}

/**
 * Hook for yearly summary export.
 */
export function useYearlySummaryExport(options?: UseExportOptions) {
  const [isExporting, setIsExporting] = useState(false);

  const exportCsv = async (year: number) => {
    setIsExporting(true);
    try {
      await exportApi.exportYearlySummaryCsv(year);
      options?.onSuccess?.();
    } catch (error) {
      console.error("Export failed:", error);
      options?.onError?.(error as Error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportCsv, isExporting };
}
