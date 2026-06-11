from datetime import datetime
from typing import Dict, List, Optional

from pydantic import BaseModel, field_validator


class TransportationInput(BaseModel):
    vehicle_type: str  # car_petrol, car_diesel, car_electric, motorbike, bus, train, bicycle, flight_domestic, flight_international
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


class WaterInput(BaseModel):
    """Water consumption carbon footprint. Factor: 0.0003 kg CO₂/litre."""
    litres_per_day: float = 0.0
    days: int = 1

    @field_validator("litres_per_day")
    @classmethod
    def non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Litres must be non-negative")
        return v


class DigitalInput(BaseModel):
    """
    Digital carbon footprint:
    - streaming_hours_month: video streaming per month (0.036 kg CO₂/hr)
    - screen_hours_day: general device usage per day (0.025 kg CO₂/hr)
    - ai_queries_month: AI/LLM queries per month (0.004 kg CO₂/query)
    - days: period for screen_hours calculation
    """
    streaming_hours_month: float = 0.0
    screen_hours_day: float = 0.0
    ai_queries_month: float = 0.0
    days: int = 30


class ShoppingInput(BaseModel):
    """
    Shopping footprint per item type (kg CO₂ per item):
    tshirt=7, jeans=33, dress=22, jacket=57, shoes=14,
    smartphone=70, laptop=200, tablet=130, tv=250, furniture=90
    """
    tshirt: float = 0.0
    jeans: float = 0.0
    dress: float = 0.0
    jacket: float = 0.0
    shoes: float = 0.0
    smartphone: float = 0.0
    laptop: float = 0.0
    tablet: float = 0.0
    tv: float = 0.0
    furniture: float = 0.0


class CarbonCalculateRequest(BaseModel):
    transportation: Optional[List[TransportationInput]] = None
    energy: Optional[EnergyInput] = None
    food: Optional[FoodInput] = None
    waste: Optional[WasteInput] = None
    water: Optional[WaterInput] = None
    digital: Optional[DigitalInput] = None
    shopping: Optional[ShoppingInput] = None


class CategoryBreakdown(BaseModel):
    transportation: float = 0.0
    energy: float = 0.0
    food: float = 0.0
    waste: float = 0.0
    water: float = 0.0
    digital: float = 0.0
    shopping: float = 0.0


class CarbonCalculateResponse(BaseModel):
    total_emission_kg: float
    category_breakdown: CategoryBreakdown
    eco_score: int
    impact_level: str
    suggestions: List[str]
    trees_equivalent: float
    cars_equivalent: float
    yearly_projection_kg: float = 0.0
    carbon_score: int = 0


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
