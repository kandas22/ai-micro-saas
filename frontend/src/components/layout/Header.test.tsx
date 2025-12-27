import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";

// Mock the Sheet component since it uses portals
vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-trigger">{children}</div>
  ),
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Header", () => {
  const defaultProps = {
    userName: "John Doe",
    onLogout: vi.fn(),
  };

  it("renders user name correctly", () => {
    render(<Header {...defaultProps} />);
    // User name appears in both desktop and mobile, so use getAllByText
    const userNames = screen.getAllByText("John Doe");
    expect(userNames.length).toBeGreaterThan(0);
  });

  it("renders navigation links", () => {
    render(<Header {...defaultProps} />);
    // Multiple nav links (desktop and mobile), so check they exist
    const dashboardLinks = screen.getAllByRole("link", { name: /dashboard/i });
    expect(dashboardLinks.length).toBeGreaterThan(0);
    const budgetLinks = screen.getAllByRole("link", { name: /budget/i });
    expect(budgetLinks.length).toBeGreaterThan(0);
    const goalsLinks = screen.getAllByRole("link", { name: /goals/i });
    expect(goalsLinks.length).toBeGreaterThan(0);
  });

  it("renders app title", () => {
    render(<Header {...defaultProps} />);
    expect(screen.getByText("Budget Tracker")).toBeInTheDocument();
  });

  it("calls onLogout when logout button is clicked", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();
    render(<Header userName="John Doe" onLogout={mockLogout} />);

    // Find the desktop logout button (there might be multiple)
    const logoutButtons = screen.getAllByRole("button", { name: /logout/i });
    await user.click(logoutButtons[0]);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("renders long user names", () => {
    render(<Header userName="Very Long User Name" onLogout={vi.fn()} />);
    // The name appears in multiple places (desktop and mobile)
    const userNames = screen.getAllByText("Very Long User Name");
    expect(userNames.length).toBeGreaterThan(0);
  });

  it("shows mobile menu trigger on small screens", () => {
    render(<Header {...defaultProps} />);
    // The mobile menu trigger should be in the DOM (hidden via CSS)
    expect(screen.getByTestId("sheet-trigger")).toBeInTheDocument();
  });
});
