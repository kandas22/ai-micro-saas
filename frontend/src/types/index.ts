/**
 * TypeScript types for the Financial Budget Tracker.
 */

// User types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  full_name?: string;
}

// Category types
export type CategoryType = "income" | "savings" | "expense";

export type ExpenseType =
  | "debt_loan"
  | "insurance"
  | "fixed"
  | "recurring"
  | "medical"
  | "discretionary";

export interface Category {
  id: number;
  name: string;
  category_type: CategoryType;
  expense_type: ExpenseType | null;
  parent_id: number | null;
  is_system_category: boolean;
  is_active: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

// Budget types
export interface BudgetEntry {
  id: number;
  user_id: number;
  category_id: number;
  category: Category | null;
  month: number;
  year: number;
  budgeted_amount: string;
  actual_amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BudgetEntryCreate {
  category_id: number;
  month: number;
  year: number;
  budgeted_amount?: string;
  actual_amount?: string;
  notes?: string;
}

export interface BudgetEntryUpdate {
  budgeted_amount?: string;
  actual_amount?: string;
  notes?: string;
}

export interface BudgetListResponse {
  entries: BudgetEntry[];
  total: number;
  month: number | null;
  year: number | null;
}

export interface BulkCreateResponse {
  created: number;
  updated: number;
  errors: Array<{ category_id: number; error: string }>;
}

// Goal types
export interface SavingsGoal {
  id: number;
  user_id: number;
  name: string;
  target_amount: string;
  current_amount: string;
  remaining_amount: string;
  progress_percentage: number;
  target_date: string | null;
  category_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface GoalCreate {
  name: string;
  target_amount: string;
  current_amount?: string;
  target_date?: string;
  category_id?: number;
}

export interface GoalUpdate {
  name?: string;
  target_amount?: string;
  current_amount?: string;
  target_date?: string;
  is_active?: boolean;
}

export interface GoalListResponse {
  goals: SavingsGoal[];
  total: number;
}

// Dashboard types
export interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  expense_type?: string;
  budgeted: string;
  actual: string;
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: string;
  total_expenses: string;
  total_savings: string;
  surplus_deficit: string;
  income_breakdown?: CategoryBreakdown[];
  expense_breakdown?: CategoryBreakdown[];
  savings_breakdown?: CategoryBreakdown[];
}

export interface YearlySummary {
  year: number;
  total_income: string;
  total_expenses: string;
  total_savings: string;
  surplus_deficit: string;
  monthly_breakdown: Array<{
    month: number;
    total_income: string;
    total_expenses: string;
    total_savings: string;
    surplus_deficit: string;
  }>;
}

// API Error
export interface ApiError {
  error: string;
  code: string;
}

// Utility types
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  debt_loan: "Debt & Loans",
  insurance: "Insurance",
  fixed: "Fixed Expenses",
  recurring: "Recurring",
  medical: "Medical",
  discretionary: "Discretionary",
};
