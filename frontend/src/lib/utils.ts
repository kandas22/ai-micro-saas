import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indian Rupees (INR) currency.
 * 
 * @param value - The numeric value to format (string or number)
 * @param options - Formatting options
 * @returns Formatted currency string with ₹ symbol
 */
export function formatCurrency(
  value: string | number | undefined,
  options?: {
    showDecimals?: boolean;
    showSign?: boolean;
  }
): string {
  if (value === undefined || value === null || value === "") {
    return options?.showDecimals !== false ? "₹0.00" : "₹0";
  }

  const num = typeof value === "string" ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return options?.showDecimals !== false ? "₹0.00" : "₹0";
  }

  const absoluteValue = Math.abs(num);
  const sign = num < 0 ? "-" : options?.showSign && num > 0 ? "+" : "";
  
  // Use Indian locale for number formatting (uses lakhs/crores grouping)
  const formatted = absoluteValue.toLocaleString("en-IN", {
    minimumFractionDigits: options?.showDecimals !== false ? 2 : 0,
    maximumFractionDigits: options?.showDecimals !== false ? 2 : 0,
  });

  return `${sign}₹${formatted}`;
}

/**
 * Format currency for chart tooltips and labels (compact format).
 */
export function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 10000000) {
    // Crores
    return `₹${(value / 10000000).toFixed(1)}Cr`;
  } else if (Math.abs(value) >= 100000) {
    // Lakhs
    return `₹${(value / 100000).toFixed(1)}L`;
  } else if (Math.abs(value) >= 1000) {
    // Thousands
    return `₹${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value, { showDecimals: false });
}
