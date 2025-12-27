"use client";

import { Button } from "@/components/ui/button";
import { MONTH_NAMES } from "@/types";

interface MonthSelectorProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

export function MonthSelector({
  year,
  month,
  onYearChange,
  onMonthChange,
}: MonthSelectorProps) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onYearChange(year - 1);
      onMonthChange(12);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onYearChange(year + 1);
      onMonthChange(1);
    } else {
      onMonthChange(month + 1);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" size="sm" onClick={handlePrevMonth}>
        Previous
      </Button>
      <div className="text-lg font-semibold min-w-[180px] text-center">
        {MONTH_NAMES[month - 1]} {year}
      </div>
      <Button variant="outline" size="sm" onClick={handleNextMonth}>
        Next
      </Button>
    </div>
  );
}
