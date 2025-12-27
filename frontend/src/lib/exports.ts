/**
 * Export API client for downloading data as CSV/Excel.
 */

import api from "./api";

interface BudgetExportParams {
  year: number;
  month?: number;
}

interface GoalExportParams {
  include_inactive?: boolean;
}

/**
 * Trigger file download from blob response.
 */
function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export const exportApi = {
  /**
   * Export budget entries as CSV.
   */
  exportBudgetsCsv: async (params: BudgetExportParams): Promise<void> => {
    const searchParams = new URLSearchParams();
    searchParams.append("year", params.year.toString());
    if (params.month) {
      searchParams.append("month", params.month.toString());
    }

    const response = await api.get(`/export/budgets/csv?${searchParams.toString()}`, {
      responseType: "blob",
    });

    const monthStr = params.month ? `_${params.month.toString().padStart(2, "0")}` : "";
    const filename = `budget_${params.year}${monthStr}.csv`;
    downloadFile(response.data, filename);
  },

  /**
   * Export budget entries as Excel.
   */
  exportBudgetsExcel: async (params: BudgetExportParams): Promise<void> => {
    const searchParams = new URLSearchParams();
    searchParams.append("year", params.year.toString());
    if (params.month) {
      searchParams.append("month", params.month.toString());
    }

    const response = await api.get(`/export/budgets/excel?${searchParams.toString()}`, {
      responseType: "blob",
    });

    const monthStr = params.month ? `_${params.month.toString().padStart(2, "0")}` : "";
    const filename = `budget_${params.year}${monthStr}.xlsx`;
    downloadFile(response.data, filename);
  },

  /**
   * Export savings goals as CSV.
   */
  exportGoalsCsv: async (params?: GoalExportParams): Promise<void> => {
    const searchParams = new URLSearchParams();
    if (params?.include_inactive !== undefined) {
      searchParams.append("include_inactive", params.include_inactive.toString());
    }

    const response = await api.get(`/export/goals/csv?${searchParams.toString()}`, {
      responseType: "blob",
    });

    downloadFile(response.data, "savings_goals.csv");
  },

  /**
   * Export savings goals as Excel.
   */
  exportGoalsExcel: async (params?: GoalExportParams): Promise<void> => {
    const searchParams = new URLSearchParams();
    if (params?.include_inactive !== undefined) {
      searchParams.append("include_inactive", params.include_inactive.toString());
    }

    const response = await api.get(`/export/goals/excel?${searchParams.toString()}`, {
      responseType: "blob",
    });

    downloadFile(response.data, "savings_goals.xlsx");
  },

  /**
   * Export yearly summary as CSV.
   */
  exportYearlySummaryCsv: async (year: number): Promise<void> => {
    const response = await api.get(`/export/yearly-summary/csv?year=${year}`, {
      responseType: "blob",
    });

    downloadFile(response.data, `yearly_summary_${year}.csv`);
  },
};

export default exportApi;
