"""
Carbon Footprint Calculation Engine

Emission factors based on peer-reviewed sources:
- IPCC (2014) AR5
- UK DEFRA 2023 Conversion Factors
- EPA Emission Factors for Greenhouse Gas Inventories
"""

from dataclasses import dataclass
from typing import Dict, List, Optional


# ─── Emission Factors (kg CO₂e per unit) ────────────────────────────────────

TRANSPORT_FACTORS: Dict[str, float] = {
    "car_petrol": 0.2100,      # per km
    "car_diesel": 0.1710,      # per km
    "car_electric": 0.0530,    # per km (grid avg)
    "motorbike": 0.1140,       # per km
    "bus": 0.0890,             # per km (per passenger)
    "train": 0.0410,           # per km (per passenger)
    "flight_domestic": 0.2550, # per km (short-haul)
    "flight_international": 0.1950,  # per km (long-haul, more efficient)
}

ENERGY_FACTORS: Dict[str, float] = {
    "electricity": 0.2330,  # per kWh (global grid avg)
    "lpg": 1.5100,          # per kg
    "natural_gas": 2.0400,  # per m³
    "renewable": 0.0100,    # per kWh (lifecycle emissions)
}

FOOD_FACTORS: Dict[str, float] = {
    "vegan": 1.50,         # kg CO₂e per day
    "vegetarian": 1.70,    # kg CO₂e per day
    "mixed": 2.50,         # kg CO₂e per day
    "high_meat": 3.30,     # kg CO₂e per day
}

WASTE_FACTORS: Dict[str, float] = {
    "general": 0.50,    # per kg
    "recycled": 0.10,   # per kg (offset from avoided production)
    "composted": 0.05,  # per kg
    "landfill": 0.80,   # per kg
}

# ─── Eco Score Thresholds ────────────────────────────────────────────────────
# Based on global per-capita emissions of ~4.7 tCO₂/yr ≈ 12.9 kg/day

ECO_LEVELS = [
    (2.0,   100, "Excellent",   "🌿 Carbon Champion"),
    (5.0,   80,  "Good",        "🌱 Eco Warrior"),
    (10.0,  60,  "Moderate",    "🌍 Climate Conscious"),
    (15.0,  40,  "High",        "⚠️ Room to Improve"),
    (float("inf"), 20, "Very High", "🔴 Critical Action Needed"),
]


@dataclass
class EmissionResult:
    total_emission_kg: float
    transportation_kg: float
    energy_kg: float
    food_kg: float
    waste_kg: float
    eco_score: int
    impact_level: str
    sustainability_rank: str
    suggestions: List[str]
    trees_equivalent: float   # trees needed to offset (per year)
    cars_equivalent: float    # equivalent car km driven


def calculate_transportation(trips: Optional[List[dict]]) -> float:
    if not trips:
        return 0.0
    total = 0.0
    for trip in trips:
        vehicle = trip.get("vehicle_type", "car_petrol")
        distance = float(trip.get("distance_km", 0))
        factor = TRANSPORT_FACTORS.get(vehicle, TRANSPORT_FACTORS["car_petrol"])
        total += distance * factor
    return round(total, 4)


def calculate_energy(energy: Optional[dict]) -> float:
    if not energy:
        return 0.0
    e = energy
    total = (
        float(e.get("electricity_kwh", 0)) * ENERGY_FACTORS["electricity"]
        + float(e.get("lpg_kg", 0)) * ENERGY_FACTORS["lpg"]
        + float(e.get("natural_gas_m3", 0)) * ENERGY_FACTORS["natural_gas"]
        + float(e.get("renewable_kwh", 0)) * ENERGY_FACTORS["renewable"]
    )
    return round(total, 4)


def calculate_food(food: Optional[dict]) -> float:
    if not food:
        return 0.0
    diet = food.get("diet_type", "mixed")
    days = int(food.get("days", 1))
    factor = FOOD_FACTORS.get(diet, FOOD_FACTORS["mixed"])
    return round(factor * days, 4)


def calculate_waste(waste: Optional[dict]) -> float:
    if not waste:
        return 0.0
    w = waste
    total = (
        float(w.get("general_kg", 0)) * WASTE_FACTORS["general"]
        + float(w.get("recycled_kg", 0)) * WASTE_FACTORS["recycled"]
        + float(w.get("composted_kg", 0)) * WASTE_FACTORS["composted"]
        + float(w.get("landfill_kg", 0)) * WASTE_FACTORS["landfill"]
    )
    return round(total, 4)


def get_eco_score(total_kg: float) -> tuple[int, str, str]:
    for threshold, score, level, rank in ECO_LEVELS:
        if total_kg <= threshold:
            return score, level, rank
    return 20, "Very High", "🔴 Critical Action Needed"


def generate_suggestions(
    transport_kg: float,
    energy_kg: float,
    food_kg: float,
    waste_kg: float,
    total_kg: float,
) -> List[str]:
    suggestions = []

    if transport_kg > 5:
        suggestions.append(
            "🚌 Switch to public transport 2×/week — save up to 15% on transport emissions."
        )
        suggestions.append(
            "🚲 For trips under 5 km, cycling saves ~210g CO₂ per km vs. petrol car."
        )
    if transport_kg > 10:
        suggestions.append(
            "✈️ One less long-haul flight saves ~0.5–2.5 tonnes CO₂ annually."
        )
    if energy_kg > 3:
        suggestions.append(
            "💡 Switch to LED bulbs — they use 75% less energy and last 25× longer."
        )
        suggestions.append(
            "🌡️ Lowering thermostat by 1°C saves ~10% on heating bills."
        )
    if energy_kg > 8:
        suggestions.append(
            "☀️ Installing solar panels could eliminate your electricity emissions entirely."
        )
    if food_kg > 3:
        suggestions.append(
            "🥗 One meat-free day per week reduces annual food emissions by ~52 kg CO₂."
        )
        suggestions.append(
            "🛒 Buying local & seasonal produce cuts food transport emissions by up to 50%."
        )
    if waste_kg > 2:
        suggestions.append(
            "♻️ Composting food waste prevents methane — 25× more potent than CO₂."
        )
        suggestions.append(
            "🛍️ Using reusable bags & containers cuts packaging waste significantly."
        )
    if total_kg < 5:
        suggestions.append(
            "🌟 Excellent work! Consider offsetting remaining emissions via tree planting."
        )
    if not suggestions:
        suggestions.append(
            "📊 Keep tracking your activities to get personalized sustainability tips!"
        )

    return suggestions[:5]  # Cap at 5 suggestions


def calculate_carbon(
    transportation: Optional[List[dict]] = None,
    energy: Optional[dict] = None,
    food: Optional[dict] = None,
    waste: Optional[dict] = None,
) -> EmissionResult:
    t_kg = calculate_transportation(transportation)
    e_kg = calculate_energy(energy)
    f_kg = calculate_food(food)
    w_kg = calculate_waste(waste)

    total = round(t_kg + e_kg + f_kg + w_kg, 4)
    eco_score, impact_level, rank = get_eco_score(total)
    suggestions = generate_suggestions(t_kg, e_kg, f_kg, w_kg, total)

    # Equivalents
    # 1 mature tree absorbs ~21.7 kg CO₂/year
    trees = round(total * 365 / 21.7, 2) if total > 0 else 0
    # Average car emits 0.21 kg/km
    cars_km = round(total / 0.21, 1) if total > 0 else 0

    return EmissionResult(
        total_emission_kg=total,
        transportation_kg=t_kg,
        energy_kg=e_kg,
        food_kg=f_kg,
        waste_kg=w_kg,
        eco_score=eco_score,
        impact_level=impact_level,
        sustainability_rank=rank,
        suggestions=suggestions,
        trees_equivalent=trees,
        cars_equivalent=cars_km,
    )
