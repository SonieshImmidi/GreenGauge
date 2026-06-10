import json
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.carbon import CarbonRecord
from app.models.user import User
from app.schemas.carbon import (
    CarbonCalculateRequest,
    CarbonCalculateResponse,
    CarbonHistoryResponse,
    CategoryBreakdown,
    DashboardReport,
)
from app.services.auth_service import get_current_user
from app.services.carbon_engine import calculate_carbon

router = APIRouter(prefix="/api/carbon", tags=["Carbon"])


@router.post("/calculate", response_model=CarbonCalculateResponse)
async def calculate_footprint(
    payload: CarbonCalculateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    transport_list = (
        [t.model_dump() for t in payload.transportation] if payload.transportation else None
    )
    energy_dict = payload.energy.model_dump() if payload.energy else None
    food_dict = payload.food.model_dump() if payload.food else None
    waste_dict = payload.waste.model_dump() if payload.waste else None

    result = calculate_carbon(transport_list, energy_dict, food_dict, waste_dict)

    # Persist a record per category that has emissions
    categories = {
        "transportation": result.transportation_kg,
        "energy": result.energy_kg,
        "food": result.food_kg,
        "waste": result.waste_kg,
    }
    for cat, val in categories.items():
        if val > 0:
            record = CarbonRecord(
                user_id=current_user.id,
                category=cat,
                emission_value=val,
                details=json.dumps({"total_session": result.total_emission_kg}),
            )
            db.add(record)

    await db.commit()

    return CarbonCalculateResponse(
        total_emission_kg=result.total_emission_kg,
        category_breakdown=CategoryBreakdown(
            transportation=result.transportation_kg,
            energy=result.energy_kg,
            food=result.food_kg,
            waste=result.waste_kg,
        ),
        eco_score=result.eco_score,
        impact_level=result.impact_level,
        suggestions=result.suggestions,
        trees_equivalent=result.trees_equivalent,
        cars_equivalent=result.cars_equivalent,
    )


@router.get("/history", response_model=CarbonHistoryResponse)
async def get_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = select(CarbonRecord).where(CarbonRecord.user_id == current_user.id)

    if category:
        query = query.where(CarbonRecord.category == category)
    if date_from:
        query = query.where(CarbonRecord.date >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.where(CarbonRecord.date <= datetime.fromisoformat(date_to))

    # Count
    count_q = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginate
    query = query.order_by(CarbonRecord.date.desc()).offset((page - 1) * page_size).limit(page_size)
    records = (await db.execute(query)).scalars().all()

    return CarbonHistoryResponse(
        records=list(records),
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/report", response_model=DashboardReport)
async def get_dashboard_report(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    thirty_days_ago = now - timedelta(days=30)

    # All records
    all_q = select(CarbonRecord).where(CarbonRecord.user_id == current_user.id)
    all_records = (await db.execute(all_q)).scalars().all()

    total_emission = sum(r.emission_value for r in all_records)

    # Monthly
    month_q = select(CarbonRecord).where(
        CarbonRecord.user_id == current_user.id,
        CarbonRecord.date >= month_start,
    )
    month_records = (await db.execute(month_q)).scalars().all()
    monthly_emission = sum(r.emission_value for r in month_records)

    # Category breakdown
    category_breakdown: dict[str, float] = {}
    for r in all_records:
        category_breakdown[r.category] = round(
            category_breakdown.get(r.category, 0) + r.emission_value, 3
        )

    # Daily trend (last 30 days)
    daily: dict[str, float] = {}
    for r in all_records:
        record_date = r.date
        if record_date.tzinfo is None:
            record_date = record_date.replace(tzinfo=timezone.utc)
        if record_date >= thirty_days_ago:
            day_key = record_date.strftime("%Y-%m-%d")
            daily[day_key] = round(daily.get(day_key, 0) + r.emission_value, 3)

    daily_trend = [{"date": k, "emission": v} for k, v in sorted(daily.items())]

    # Monthly trend (last 12 months)
    monthly: dict[str, float] = {}
    for r in all_records:
        key = r.date.strftime("%Y-%m")
        monthly[key] = round(monthly.get(key, 0) + r.emission_value, 3)

    monthly_trend = [{"month": k, "emission": v} for k, v in sorted(monthly.items())[-12:]]

    # Eco score
    daily_avg = total_emission / max(len(set(r.date.strftime("%Y-%m-%d") for r in all_records)), 1)
    from app.services.carbon_engine import get_eco_score
    eco_score, _, rank = get_eco_score(daily_avg)

    return DashboardReport(
        total_emission_kg=round(total_emission, 3),
        monthly_emission_kg=round(monthly_emission, 3),
        daily_average_kg=round(daily_avg, 3),
        eco_score=eco_score,
        sustainability_rank=rank,
        category_breakdown=category_breakdown,
        daily_trend=daily_trend,
        monthly_trend=monthly_trend,
        total_records=len(all_records),
    )
