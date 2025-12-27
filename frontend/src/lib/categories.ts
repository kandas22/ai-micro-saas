/**
 * Categories API functions.
 */

import api from "./api";
import type { Category, CategoryListResponse, CategoryType } from "@/types";

interface CategoryFilters {
  type?: CategoryType;
  include_inactive?: boolean;
}

export const categoryApi = {
  /**
   * Get all categories.
   */
  getCategories: async (filters?: CategoryFilters): Promise<CategoryListResponse> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.include_inactive) params.append("include_inactive", "true");

    const response = await api.get<CategoryListResponse>(`/categories?${params.toString()}`);
    return response.data;
  },

  /**
   * Get a single category.
   */
  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  /**
   * Create a custom category.
   */
  createCategory: async (data: {
    name: string;
    category_type: CategoryType;
    expense_type?: string;
    parent_id?: number;
  }): Promise<Category> => {
    const response = await api.post<Category>("/categories", data);
    return response.data;
  },

  /**
   * Update a category.
   */
  updateCategory: async (id: number, data: { name?: string; is_active?: boolean }): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete a category.
   */
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default categoryApi;
