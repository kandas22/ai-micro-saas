import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExportMenu } from "./ExportMenu";

describe("ExportMenu", () => {
  const defaultProps = {
    onExportCsv: vi.fn(),
    onExportExcel: vi.fn(),
    isExporting: false,
  };

  it("renders export button with default label", () => {
    render(<ExportMenu {...defaultProps} />);
    expect(screen.getByRole("button", { name: /export/i })).toBeInTheDocument();
  });

  it("renders custom label when provided", () => {
    render(<ExportMenu {...defaultProps} label="Export Month" />);
    expect(screen.getByRole("button", { name: /export month/i })).toBeInTheDocument();
  });

  it("shows exporting state", () => {
    render(<ExportMenu {...defaultProps} isExporting={true} />);
    expect(screen.getByRole("button", { name: /exporting/i })).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("button is not disabled when not exporting", () => {
    render(<ExportMenu {...defaultProps} isExporting={false} />);
    expect(screen.getByRole("button")).not.toBeDisabled();
  });

  it("has correct button variant", () => {
    render(<ExportMenu {...defaultProps} />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
