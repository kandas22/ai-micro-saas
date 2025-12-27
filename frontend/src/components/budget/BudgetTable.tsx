"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BudgetEntry, Category, CategoryType } from "@/types";

interface BudgetTableProps {
  entries: BudgetEntry[];
  categories: Category[];
  categoryType: CategoryType;
  onUpdate: (id: number, field: "budgeted_amount" | "actual_amount", value: string) => void;
  isLoading?: boolean;
}

const categoryTypeLabels: Record<CategoryType, string> = {
  income: "Income",
  savings: "Savings",
  expense: "Expenses",
};

const categoryTypeColors: Record<CategoryType, string> = {
  income: "bg-green-50 border-green-200",
  savings: "bg-blue-50 border-blue-200",
  expense: "bg-red-50 border-red-200",
};

export function BudgetTable({
  entries,
  categories,
  categoryType,
  onUpdate,
}: BudgetTableProps) {
  const [editingCell, setEditingCell] = useState<{
    entryId: number;
    field: "budgeted_amount" | "actual_amount";
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter categories by type
  const filteredCategories = categories.filter(
    (cat) => cat.category_type === categoryType && cat.is_active
  );

  // Create a map of entries by category_id
  const entryMap = new Map(entries.map((e) => [e.category_id, e]));

  const handleEdit = (
    entryId: number,
    field: "budgeted_amount" | "actual_amount",
    currentValue: string
  ) => {
    setEditingCell({ entryId, field });
    setEditValue(currentValue);
  };

  const handleSave = (entryId: number, field: "budgeted_amount" | "actual_amount") => {
    onUpdate(entryId, field, editValue);
    setEditingCell(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
  };

  // Calculate totals
  const totalBudgeted = entries.reduce(
    (sum, e) => sum + parseFloat(e.budgeted_amount || "0"),
    0
  );
  const totalActual = entries.reduce(
    (sum, e) => sum + parseFloat(e.actual_amount || "0"),
    0
  );
  const totalDifference = totalActual - totalBudgeted;

  const getDifferenceColor = (diff: number) => {
    if (diff === 0) return "";
    if (categoryType === "income") {
      return diff > 0 ? "text-green-600" : "text-red-600";
    }
    return diff > 0 ? "text-red-600" : "text-green-600";
  };

  return (
    <div className={`rounded-lg border ${categoryTypeColors[categoryType]} overflow-hidden`}>
      {/* Header with toggle */}
      <button
        className="w-full px-4 py-3 border-b font-semibold flex justify-between items-center hover:bg-white/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{categoryTypeLabels[categoryType]}</span>
        <div className="flex items-center gap-3">
          <span className="text-sm font-normal text-gray-600">
            {formatCurrency(totalActual.toString())}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <>
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="text-sm text-gray-600 border-b bg-white/50">
                  <th className="text-left px-4 py-2 font-medium">Category</th>
                  <th className="text-right px-4 py-2 font-medium w-32">Budgeted</th>
                  <th className="text-right px-4 py-2 font-medium w-32">Actual</th>
                  <th className="text-right px-4 py-2 font-medium w-28">Diff</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredCategories.map((category) => {
                  const entry = entryMap.get(category.id);
                  const budgeted = parseFloat(entry?.budgeted_amount || "0");
                  const actual = parseFloat(entry?.actual_amount || "0");
                  const difference = actual - budgeted;

                  return (
                    <tr key={category.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">{category.name}</td>
                      <td className="px-4 py-2 text-right">
                        {editingCell?.entryId === entry?.id &&
                        editingCell?.field === "budgeted_amount" ? (
                          <div className="flex items-center gap-1 justify-end">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 h-7 text-right text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && entry) {
                                  handleSave(entry.id, "budgeted_amount");
                                } else if (e.key === "Escape") {
                                  handleCancel();
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => entry && handleSave(entry.id, "budgeted_amount")}
                            >
                              OK
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-blue-600 text-sm"
                            onClick={() =>
                              entry &&
                              handleEdit(entry.id, "budgeted_amount", entry.budgeted_amount)
                            }
                          >
                            {formatCurrency(entry?.budgeted_amount || "0")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {editingCell?.entryId === entry?.id &&
                        editingCell?.field === "actual_amount" ? (
                          <div className="flex items-center gap-1 justify-end">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 h-7 text-right text-sm"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && entry) {
                                  handleSave(entry.id, "actual_amount");
                                } else if (e.key === "Escape") {
                                  handleCancel();
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => entry && handleSave(entry.id, "actual_amount")}
                            >
                              OK
                            </Button>
                          </div>
                        ) : (
                          <span
                            className="cursor-pointer hover:text-blue-600 text-sm"
                            onClick={() =>
                              entry &&
                              handleEdit(entry.id, "actual_amount", entry.actual_amount)
                            }
                          >
                            {formatCurrency(entry?.actual_amount || "0")}
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-2 text-right text-sm ${getDifferenceColor(difference)}`}>
                        {difference !== 0 && (difference > 0 ? "+" : "")}
                        {formatCurrency(difference.toString())}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-medium text-sm">
                <tr>
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalBudgeted.toString())}</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totalActual.toString())}</td>
                  <td className={`px-4 py-2 text-right ${getDifferenceColor(totalDifference)}`}>
                    {formatCurrency(totalDifference.toString())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden bg-white divide-y">
            {filteredCategories.map((category) => {
              const entry = entryMap.get(category.id);
              const budgeted = parseFloat(entry?.budgeted_amount || "0");
              const actual = parseFloat(entry?.actual_amount || "0");
              const difference = actual - budgeted;

              return (
                <div key={category.id} className="p-3">
                  <div className="font-medium text-sm mb-2">{category.name}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Budgeted</div>
                      {editingCell?.entryId === entry?.id &&
                      editingCell?.field === "budgeted_amount" ? (
                        <div className="flex flex-col gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && entry) {
                                handleSave(entry.id, "budgeted_amount");
                              } else if (e.key === "Escape") {
                                handleCancel();
                              }
                            }}
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-6 text-xs flex-1"
                              onClick={() => entry && handleSave(entry.id, "budgeted_amount")}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={handleCancel}
                            >
                              X
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="font-medium cursor-pointer hover:text-blue-600"
                          onClick={() =>
                            entry &&
                            handleEdit(entry.id, "budgeted_amount", entry.budgeted_amount)
                          }
                        >
                          {formatCurrency(entry?.budgeted_amount || "0")}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Actual</div>
                      {editingCell?.entryId === entry?.id &&
                      editingCell?.field === "actual_amount" ? (
                        <div className="flex flex-col gap-1">
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && entry) {
                                handleSave(entry.id, "actual_amount");
                              } else if (e.key === "Escape") {
                                handleCancel();
                              }
                            }}
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-6 text-xs flex-1"
                              onClick={() => entry && handleSave(entry.id, "actual_amount")}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 text-xs"
                              onClick={handleCancel}
                            >
                              X
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="font-medium cursor-pointer hover:text-blue-600"
                          onClick={() =>
                            entry &&
                            handleEdit(entry.id, "actual_amount", entry.actual_amount)
                          }
                        >
                          {formatCurrency(entry?.actual_amount || "0")}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Diff</div>
                      <div className={`font-medium ${getDifferenceColor(difference)}`}>
                        {difference !== 0 && (difference > 0 ? "+" : "")}
                        {formatCurrency(difference.toString())}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Mobile Total */}
            <div className="p-3 bg-gray-50">
              <div className="font-medium text-sm mb-2">Total</div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Budgeted</div>
                  <div className="font-semibold">{formatCurrency(totalBudgeted.toString())}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Actual</div>
                  <div className="font-semibold">{formatCurrency(totalActual.toString())}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Diff</div>
                  <div className={`font-semibold ${getDifferenceColor(totalDifference)}`}>
                    {formatCurrency(totalDifference.toString())}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
