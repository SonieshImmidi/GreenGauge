from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.carbon import CarbonRecord
from app.models.user import User
from app.services.auth_service import get_current_user
from app.services.recommendation_engine import get_recommendations_for_profile

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])


@router.get("")
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Find top emission category for this user
    records_q = select(CarbonRecord).where(CarbonRecord.user_id == current_user.id)
    records = (await db.execute(records_q)).scalars().all()

    total_kg = sum(r.emission_value for r in records)

    # Aggregate by category
    cat_totals: dict[str, float] = {}
    for r in records:
        cat_totals[r.category] = cat_totals.get(r.category, 0) + r.emission_value

    top_category = max(cat_totals, key=cat_totals.get) if cat_totals else "transportation"

    recommendations = get_recommendations_for_profile(top_category, total_kg, current_user.id)

    return {
        "recommendations": recommendations,
        "top_emission_category": top_category,
        "total_emission_kg": round(total_kg, 3),
        "count": len(recommendations),
    }
