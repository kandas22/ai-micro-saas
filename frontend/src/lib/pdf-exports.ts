import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BudgetEntry, MONTH_NAMES, EXPENSE_TYPE_LABELS } from "@/types";
import { formatCurrency } from "./utils";

/**
 * Generate PDF for budget entries.
 */
export function generateBudgetPdf(
    entries: BudgetEntry[],
    year: number,
    month?: number
) {
    const doc = new jsPDF();
    const monthName = month ? MONTH_NAMES[month - 1] : "All Months";
    const title = `Budget Report - ${monthName} ${year}`;

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

    // Define columns
    const tableColumn = [
        "Category",
        "Type",
        "Expense Type",
        "Budgeted",
        "Actual",
        "Difference",
        "Notes",
    ];

    // Map data to rows
    const tableRows: (string | number)[][] = [];

    entries.forEach((entry) => {
        const category = entry.category;
        const categoryName = category?.name || "Unknown";
        const categoryType = category?.category_type
            ? category.category_type.charAt(0).toUpperCase() +
            category.category_type.slice(1)
            : "Unknown";

        const expenseType =
            category?.expense_type && EXPENSE_TYPE_LABELS[category.expense_type]
                ? EXPENSE_TYPE_LABELS[category.expense_type]
                : "-";

        const budgeted = parseFloat(entry.budgeted_amount);
        const actual = parseFloat(entry.actual_amount);
        const difference = actual - budgeted;

        const row = [
            categoryName,
            categoryType,
            expenseType,
            formatCurrency(budgeted),
            formatCurrency(actual),
            formatCurrency(difference),
            entry.notes || "",
        ];
        tableRows.push(row);
    });

    // Calculate summary
    let totalIncome = 0;
    let totalExpenses = 0;
    let totalSavings = 0;

    entries.forEach((entry) => {
        const type = entry.category?.category_type;
        const amount = parseFloat(entry.actual_amount) || parseFloat(entry.budgeted_amount) || 0;

        if (type === "income") totalIncome += amount;
        else if (type === "expense") totalExpenses += amount;
        else if (type === "savings") totalSavings += amount;
    });

    const surplus = totalIncome - totalExpenses - totalSavings;

    // Add table
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [68, 114, 196] },
        columnStyles: {
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "right" },
        },
        didParseCell: (data) => {
            // Color code difference column
            if (data.section === "body" && data.column.index === 5) {
                const rawDiff = data.cell.raw as string;
                // Simple check if string starts with '-'
                if (rawDiff.includes("-")) {
                    // Optional: red for negative? 
                    // In budget context: negative actual-budgeted usually describes overspending or under-earning depending on context.
                    // But let's keep it simple.
                }
            }
        }
    });

    // Add Summary
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 40;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Summary", 14, finalY + 15);

    doc.setFontSize(10);
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 14, finalY + 25);
    doc.text(`Total Expenses: ${formatCurrency(totalExpenses)}`, 14, finalY + 32);
    doc.text(`Total Savings: ${formatCurrency(totalSavings)}`, 14, finalY + 39);

    doc.setFontSize(11);
    if (surplus >= 0) {
        doc.setTextColor(0, 128, 0); // Green
        doc.text(`Surplus: ${formatCurrency(surplus)}`, 14, finalY + 48);
    } else {
        doc.setTextColor(255, 0, 0); // Red
        doc.text(`Deficit: ${formatCurrency(surplus)}`, 14, finalY + 48);
    }

    // Save the PDF
    const fileName = `budget_${year}_${month ? month.toString().padStart(2, "0") : "all"}.pdf`;
    doc.save(fileName);
}
