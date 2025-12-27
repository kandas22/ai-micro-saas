/**
 * Goals API client for savings goals endpoints.
 */

import api from "./api";
import type {
  SavingsGoal,
  GoalCreate,
  GoalUpdate,
  GoalListResponse,
} from "@/types";

interface GoalFilters {
  include_inactive?: boolean;
}

export const goalsApi = {
  /**
   * Get all savings goals.
   */
  getGoals: async (filters?: GoalFilters): Promise<GoalListResponse> => {
    const params = new URLSearchParams();
    if (filters?.include_inactive) {
      params.append("include_inactive", "true");
    }
    const response = await api.get<GoalListResponse>(`/goals?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single goal by ID.
   */
  getGoal: async (id: number): Promise<SavingsGoal> => {
    const response = await api.get<SavingsGoal>(`/goals/${id}`);
    return response.data;
  },

  /**
   * Create a new savings goal.
   */
  createGoal: async (data: GoalCreate): Promise<SavingsGoal> => {
    const response = await api.post<SavingsGoal>("/goals", data);
    return response.data;
  },

  /**
   * Update a savings goal.
   */
  updateGoal: async (id: number, data: GoalUpdate): Promise<SavingsGoal> => {
    const response = await api.put<SavingsGoal>(`/goals/${id}`, data);
    return response.data;
  },

  /**
   * Delete a savings goal.
   */
  deleteGoal: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  /**
   * Update goal progress (add/subtract from current amount).
   */
  updateProgress: async (id: number, amount: number): Promise<SavingsGoal> => {
    const response = await api.post<SavingsGoal>(`/goals/${id}/progress`, { amount });
    return response.data;
  },
};

export default goalsApi;
