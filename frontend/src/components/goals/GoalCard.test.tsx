import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoalCard } from "./GoalCard";
import type { SavingsGoal } from "@/types";

// Mock the hooks
vi.mock("@/hooks/use-goals", () => ({
  useUpdateGoalProgress: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useDeleteGoal: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useUpdateGoal: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("GoalCard", () => {
  const mockGoal: SavingsGoal = {
    id: 1,
    user_id: 1,
    name: "Emergency Fund",
    target_amount: "10000.00",
    current_amount: "2500.00",
    target_date: "2025-12-31",
    is_active: true,
    progress_percentage: 25,
    remaining_amount: "7500.00",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
  };

  const mockOnEdit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders goal name", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
  });

  it("displays current amount correctly", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("$2,500.00")).toBeInTheDocument();
  });

  it("displays target amount correctly", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("$10,000.00")).toBeInTheDocument();
  });

  it("displays remaining amount correctly", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("$7,500.00")).toBeInTheDocument();
  });

  it("displays progress percentage", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("25.0%")).toBeInTheDocument();
  });

  it("displays target date", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText(/Dec 31, 2025/)).toBeInTheDocument();
  });

  it("shows completed badge when goal is 100%", () => {
    const completedGoal: SavingsGoal = {
      ...mockGoal,
      current_amount: "10000.00",
      remaining_amount: "0.00",
      progress_percentage: 100,
    };
    render(<GoalCard goal={completedGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Goal Achieved!")).toBeInTheDocument();
  });

  it("shows inactive badge when goal is inactive", () => {
    const inactiveGoal: SavingsGoal = { ...mockGoal, is_active: false };
    render(<GoalCard goal={inactiveGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("shows Add Funds button for active goals", () => {
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByRole("button", { name: /add funds/i })).toBeInTheDocument();
  });

  it("does not show Add Funds button for completed goals", () => {
    const completedGoal: SavingsGoal = {
      ...mockGoal,
      progress_percentage: 100,
    };
    render(<GoalCard goal={completedGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.queryByRole("button", { name: /add funds/i })).not.toBeInTheDocument();
  });

  it("opens fund input when Add Funds is clicked", async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole("button", { name: /add funds/i }));

    expect(screen.getByPlaceholderText("Amount")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /withdraw/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("closes fund input when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });

    await user.click(screen.getByRole("button", { name: /add funds/i }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByPlaceholderText("Amount")).not.toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<GoalCard goal={mockGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });

    // Find edit button (first button with svg)
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[0]); // Edit button is first

    expect(mockOnEdit).toHaveBeenCalledWith(mockGoal);
  });

  it("shows overdue badge when past target date", () => {
    const overdueGoal: SavingsGoal = {
      ...mockGoal,
      target_date: "2020-01-01",
      progress_percentage: 50,
    };
    render(<GoalCard goal={overdueGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("does not show overdue badge if goal is completed", () => {
    const completedGoal: SavingsGoal = {
      ...mockGoal,
      target_date: "2020-01-01",
      progress_percentage: 100,
    };
    render(<GoalCard goal={completedGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.queryByText("Overdue")).not.toBeInTheDocument();
  });

  it("handles goal without target date", () => {
    const noDateGoal: SavingsGoal = { ...mockGoal, target_date: null };
    render(<GoalCard goal={noDateGoal} onEdit={mockOnEdit} />, {
      wrapper: createWrapper(),
    });
    expect(screen.queryByText(/Target:/)).not.toBeInTheDocument();
  });
});
