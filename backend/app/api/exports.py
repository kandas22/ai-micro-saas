"""
Export API endpoints for downloading data as CSV/Excel.
"""

from flask import request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import api_bp
from ..services.export_service import ExportService
from ..services.budget_service import BudgetService
from ..services.goal_service import GoalService


@api_bp.route("/export/budgets/csv", methods=["GET"])
@jwt_required()
def export_budgets_csv():
    """
    Export budget entries as CSV.

    Query Parameters:
        year: Year to export (required).
        month: Month to export (optional).

    Returns:
        CSV file download.
    """
    user_id = int(get_jwt_identity())

    year = request.args.get("year", type=int)
    month = request.args.get("month", type=int)

    if not year:
        return {"error": "Year is required", "code": "VALIDATION_ERROR"}, 400

    # Get budget entries
    entries = BudgetService.get_budget_entries(
        user_id=user_id,
        year=year,
        month=month
    )

    # Generate CSV
    csv_data = ExportService.export_budgets_csv(entries, year, month)

    # Create filename
    month_str = f"_{month:02d}" if month else ""
    filename = f"budget_{year}{month_str}.csv"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@api_bp.route("/export/budgets/excel", methods=["GET"])
@jwt_required()
def export_budgets_excel():
    """
    Export budget entries as Excel file.

    Query Parameters:
        year: Year to export (required).
        month: Month to export (optional).

    Returns:
        Excel file download.
    """
    user_id = int(get_jwt_identity())

    year = request.args.get("year", type=int)
    month = request.args.get("month", type=int)

    if not year:
        return {"error": "Year is required", "code": "VALIDATION_ERROR"}, 400

    # Get budget entries
    entries = BudgetService.get_budget_entries(
        user_id=user_id,
        year=year,
        month=month
    )

    # Generate Excel
    excel_data = ExportService.export_budgets_excel(entries, year, month)

    # Create filename
    month_str = f"_{month:02d}" if month else ""
    filename = f"budget_{year}{month_str}.xlsx"

    return Response(
        excel_data,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@api_bp.route("/export/goals/csv", methods=["GET"])
@jwt_required()
def export_goals_csv():
    """
    Export savings goals as CSV.

    Query Parameters:
        include_inactive: Include inactive goals (default: true for export).

    Returns:
        CSV file download.
    """
    user_id = int(get_jwt_identity())

    include_inactive = request.args.get("include_inactive", "true").lower() == "true"

    # Get goals
    goals = GoalService.get_goals(user_id, include_inactive)

    # Generate CSV
    csv_data = ExportService.export_goals_csv(goals)

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment; filename=savings_goals.csv"}
    )


@api_bp.route("/export/goals/excel", methods=["GET"])
@jwt_required()
def export_goals_excel():
    """
    Export savings goals as Excel file.

    Query Parameters:
        include_inactive: Include inactive goals (default: true for export).

    Returns:
        Excel file download.
    """
    user_id = int(get_jwt_identity())

    include_inactive = request.args.get("include_inactive", "true").lower() == "true"

    # Get goals
    goals = GoalService.get_goals(user_id, include_inactive)

    # Generate Excel
    excel_data = ExportService.export_goals_excel(goals)

    return Response(
        excel_data,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=savings_goals.xlsx"}
    )


@api_bp.route("/export/yearly-summary/csv", methods=["GET"])
@jwt_required()
def export_yearly_summary_csv():
    """
    Export yearly summary as CSV.

    Query Parameters:
        year: Year to export (required).

    Returns:
        CSV file download.
    """
    user_id = int(get_jwt_identity())

    year = request.args.get("year", type=int)

    if not year:
        return {"error": "Year is required", "code": "VALIDATION_ERROR"}, 400

    # Get yearly summary
    summary = BudgetService.get_yearly_summary(user_id, year)

    # Generate CSV
    csv_data = ExportService.export_yearly_summary_csv(
        summary.get("monthly_breakdown", []),
        year
    )

    filename = f"yearly_summary_{year}.csv"

    return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
