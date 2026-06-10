from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, field_validator


class TransportationInput(BaseModel):
    vehicle_type: str  # car_petrol, car_diesel, car_electric, motorbike, bus, train, flight_domestic, flight_international
    distance_km: float

    @field_validator("distance_km")
    @classmethod
    def positive_distance(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Distance must be non-negative")
        return v


class EnergyInput(BaseModel):
    electricity_kwh: float = 0.0
    lpg_kg: float = 0.0
    natural_gas_m3: float = 0.0
    renewable_kwh: float = 0.0


class FoodInput(BaseModel):
    diet_type: str  # vegan, vegetarian, mixed, high_meat
    days: int = 1


class WasteInput(BaseModel):
    general_kg: float = 0.0
    recycled_kg: float = 0.0
    composted_kg: float = 0.0
    landfill_kg: float = 0.0


class CarbonCalculateRequest(BaseModel):
    transportation: Optional[List[TransportationInput]] = None
    energy: Optional[EnergyInput] = None
    food: Optional[FoodInput] = None
    waste: Optional[WasteInput] = None


class CategoryBreakdown(BaseModel):
    transportation: float = 0.0
    energy: float = 0.0
    food: float = 0.0
    waste: float = 0.0


class CarbonCalculateResponse(BaseModel):
    total_emission_kg: float
    category_breakdown: CategoryBreakdown
    eco_score: int
    impact_level: str
    suggestions: List[str]
    trees_equivalent: float
    cars_equivalent: float


class CarbonRecordResponse(BaseModel):
    id: str
    category: str
    sub_category: Optional[str]
    emission_value: float
    details: Optional[str]
    date: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class CarbonHistoryResponse(BaseModel):
    records: List[CarbonRecordResponse]
    total: int
    page: int
    page_size: int


class DashboardReport(BaseModel):
    total_emission_kg: float
    monthly_emission_kg: float
    daily_average_kg: float
    eco_score: int
    sustainability_rank: str
    category_breakdown: Dict[str, float]
    daily_trend: List[Dict]
    monthly_trend: List[Dict]
    total_records: int
