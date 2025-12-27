/**
 * Budget API functions.
 */

import api from "./api";
import type {
  BudgetEntry,
  BudgetEntryCreate,
  BudgetEntryUpdate,
  BudgetListResponse,
  BulkCreateResponse,
  MonthlySummary,
  YearlySummary,
  CategoryType,
} from "@/types";

interface BudgetFilters {
  month?: number;
  year?: number;
  category_id?: number;
  category_type?: CategoryType;
}

export const budgetApi = {
  /**
   * Get budget entries with optional filters.
   */
  getEntries: async (filters?: BudgetFilters): Promise<BudgetListResponse> => {
    const params = new URLSearchParams();
    if (filters?.month) params.append("month", filters.month.toString());
    if (filters?.year) params.append("year", filters.year.toString());
    if (filters?.category_id) params.append("category_id", filters.category_id.toString());
    if (filters?.category_type) params.append("category_type", filters.category_type);

    const response = await api.get<BudgetListResponse>(`/budgets?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single budget entry.
   */
  getEntry: async (id: number): Promise<BudgetEntry> => {
    const response = await api.get<BudgetEntry>(`/budgets/${id}`);
    return response.data;
  },

  /**
   * Create a new budget entry.
   */
  createEntry: async (data: BudgetEntryCreate): Promise<BudgetEntry> => {
    const response = await api.post<BudgetEntry>("/budgets", data);
    return response.data;
  },

  /**
   * Update a budget entry.
   */
  updateEntry: async (id: number, data: BudgetEntryUpdate): Promise<BudgetEntry> => {
    const response = await api.put<BudgetEntry>(`/budgets/${id}`, data);
    return response.data;
  },

  /**
   * Delete a budget entry.
   */
  deleteEntry: async (id: number): Promise<void> => {
    await api.delete(`/budgets/${id}`);
  },

  /**
   * Bulk create or update budget entries.
   */
  bulkCreateOrUpdate: async (entries: BudgetEntryCreate[]): Promise<BulkCreateResponse> => {
    const response = await api.post<BulkCreateResponse>("/budgets/bulk", { entries });
    return response.data;
  },

  /**
   * Get monthly financial summary.
   */
  getMonthlySummary: async (year: number, month: number): Promise<MonthlySummary> => {
    const response = await api.get<MonthlySummary>(`/budgets/summary/monthly/${year}/${month}`);
    return response.data;
  },

  /**
   * Get yearly financial summary.
   */
  getYearlySummary: async (year: number): Promise<YearlySummary> => {
    const response = await api.get<YearlySummary>(`/budgets/summary/yearly/${year}`);
    return response.data;
  },
};

export default budgetApi;
