import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetTable } from "./BudgetTable";
import type { BudgetEntry, Category } from "@/types";

describe("BudgetTable", () => {
  const mockCategories: Category[] = [
    { id: 1, name: "Salary", category_type: "income", is_default: true, is_active: true },
    { id: 2, name: "Freelance", category_type: "income", is_default: false, is_active: true },
    { id: 3, name: "Rent", category_type: "expense", is_default: true, is_active: true },
  ];

  const mockEntries: BudgetEntry[] = [
    {
      id: 1,
      category_id: 1,
      month: 12,
      year: 2025,
      budgeted_amount: "5000.00",
      actual_amount: "5200.00",
      category: mockCategories[0],
    },
    {
      id: 2,
      category_id: 2,
      month: 12,
      year: 2025,
      budgeted_amount: "1000.00",
      actual_amount: "800.00",
      category: mockCategories[1],
    },
  ];

  const defaultProps = {
    entries: mockEntries,
    categories: mockCategories,
    categoryType: "income" as const,
    onUpdate: vi.fn(),
    isLoading: false,
  };

  it("renders table header with category type label", () => {
    render(<BudgetTable {...defaultProps} />);
    expect(screen.getByText("Income")).toBeInTheDocument();
  });

  it("renders category names in desktop and mobile views", () => {
    render(<BudgetTable {...defaultProps} />);
    // Categories appear in both desktop table and mobile cards
    const salaryElements = screen.getAllByText("Salary");
    const freelanceElements = screen.getAllByText("Freelance");
    expect(salaryElements.length).toBeGreaterThan(0);
    expect(freelanceElements.length).toBeGreaterThan(0);
  });

  it("formats currency values correctly", () => {
    render(<BudgetTable {...defaultProps} />);
    // Check for budgeted amounts (appear in both desktop and mobile)
    const budgetedAmounts = screen.getAllByText("₹5,000.00");
    expect(budgetedAmounts.length).toBeGreaterThan(0);
  });

  it("calculates and displays totals", () => {
    render(<BudgetTable {...defaultProps} />);
    // Total budgeted: 5000 + 1000 = 6000, Total actual: 5200 + 800 = 6000
    const totals = screen.getAllByText("₹6,000.00");
    expect(totals.length).toBeGreaterThan(0);
  });

  it("shows positive difference for overperforming income", () => {
    render(<BudgetTable {...defaultProps} />);
    // Salary: 5200 - 5000 = +200
    const positiveAmounts = screen.getAllByText("+₹200.00");
    expect(positiveAmounts.length).toBeGreaterThan(0);
  });

  it("shows negative difference for underperforming income", () => {
    render(<BudgetTable {...defaultProps} />);
    // Freelance: 800 - 1000 = -200 (formatted as -₹200.00)
    const negativeAmounts = screen.getAllByText("-₹200.00");
    expect(negativeAmounts.length).toBeGreaterThan(0);
  });

  it("can be collapsed and expanded", async () => {
    const user = userEvent.setup();
    render(<BudgetTable {...defaultProps} />);

    // Table should be visible by default
    const salaryElements = screen.getAllByText("Salary");
    expect(salaryElements.length).toBeGreaterThan(0);

    // Click the header to collapse
    const toggleButton = screen.getByRole("button", { name: /income/i });
    await user.click(toggleButton);

    // Categories should not be visible
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();

    // Click again to expand
    await user.click(toggleButton);
    const salaryAfterExpand = screen.getAllByText("Salary");
    expect(salaryAfterExpand.length).toBeGreaterThan(0);
  });

  it("filters categories by type", () => {
    render(<BudgetTable {...defaultProps} categoryType="expense" entries={[]} />);
    // Should not show income categories in expense table
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.queryByText("Freelance")).not.toBeInTheDocument();
  });

  it("allows editing values via click", async () => {
    const user = userEvent.setup();
    const mockOnUpdate = vi.fn();
    render(<BudgetTable {...defaultProps} onUpdate={mockOnUpdate} />);

    // Click on a budgeted amount to edit (first one in desktop view)
    const budgetedAmounts = screen.getAllByText("₹5,000.00");
    await user.click(budgetedAmounts[0]);

    // Should show an input field
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("displays expense categories correctly", () => {
    const expenseEntries: BudgetEntry[] = [
      {
        id: 3,
        category_id: 3,
        month: 12,
        year: 2025,
        budgeted_amount: "1500.00",
        actual_amount: "1200.00",
        category: mockCategories[2],
      },
    ];

    render(
      <BudgetTable
        entries={expenseEntries}
        categories={mockCategories}
        categoryType="expense"
        onUpdate={vi.fn()}
      />
    );

    // Should show "Expenses" header
    expect(screen.getByText("Expenses")).toBeInTheDocument();
    // Should show Rent category
    const rentElements = screen.getAllByText("Rent");
    expect(rentElements.length).toBeGreaterThan(0);
  });
});
