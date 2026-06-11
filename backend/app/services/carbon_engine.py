"""
Carbon Footprint Calculation Engine

Emission factors based on peer-reviewed sources:
- IPCC (2014) AR5
- UK DEFRA 2023 Conversion Factors
- EPA Emission Factors for Greenhouse Gas Inventories
- Water: Water UK Life Cycle Assessment 2021
- Digital: IEA Electricity & the Future of Digital Economy 2022
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional


# ─── Emission Factors (kg CO₂e per unit) ────────────────────────────────────

TRANSPORT_FACTORS: Dict[str, float] = {
    "car_petrol": 0.1920,       # per km (DEFRA 2023)
    "car_diesel": 0.1710,       # per km
    "car_electric": 0.0530,     # per km (grid avg)
    "motorbike": 0.1140,        # per km
    "bus": 0.1050,              # per km (per passenger)
    "train": 0.0410,            # per km (per passenger)
    "bicycle": 0.0000,          # zero direct emissions
    "flight_domestic": 0.2550,  # per km (short-haul)
    "flight_international": 0.1950,  # per km (long-haul, more efficient)
}

ENERGY_FACTORS: Dict[str, float] = {
    "electricity": 0.8200,  # per kWh (India grid avg — more accurate for Indian users)
    "lpg": 3.0000,          # per kg (cooking gas, user spec)
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
    "general": 0.57,    # per kg (user spec)
    "recycled": 0.10,   # per kg (offset from avoided production)
    "composted": 0.05,  # per kg
    "landfill": 0.80,   # per kg
}

# Water: 0.0003 kg CO₂ per litre (UK Water UK LCA 2021)
WATER_FACTOR: float = 0.0003  # per litre

# Digital emission factors
DIGITAL_FACTORS: Dict[str, float] = {
    "streaming_hour": 0.0360,   # kg CO₂ per hour of video streaming (IEA 2022)
    "screen_hour": 0.0250,      # kg CO₂ per hour of general screen use
    "ai_query": 0.0040,         # kg CO₂ per AI query (estimated, ChatGPT-scale)
}

# Shopping product emission factors (kg CO₂ per item)
SHOPPING_FACTORS: Dict[str, float] = {
    "tshirt": 7.0,          # cotton T-shirt lifecycle
    "jeans": 33.0,          # denim jeans lifecycle
    "dress": 22.0,          # average dress
    "jacket": 57.0,         # jacket/coat
    "shoes": 14.0,          # average pair of shoes
    "smartphone": 70.0,     # smartphone manufacture
    "laptop": 200.0,        # laptop manufacture
    "tablet": 130.0,        # tablet manufacture
    "tv": 250.0,            # TV manufacture
    "furniture": 90.0,      # average furniture item
}

# ─── Eco Score Thresholds (per day kg CO₂) ──────────────────────────────────
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
    water_kg: float = 0.0
    digital_kg: float = 0.0
    shopping_kg: float = 0.0
    eco_score: int = 0
    impact_level: str = "Moderate"
    sustainability_rank: str = "🌍 Climate Conscious"
    suggestions: List[str] = field(default_factory=list)
    trees_equivalent: float = 0.0   # trees needed to offset (per year)
    cars_equivalent: float = 0.0    # equivalent car km driven
    yearly_projection_kg: float = 0.0
    carbon_score: int = 0           # 0-100 sustainability score


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


def calculate_water(water: Optional[dict]) -> float:
    """Water consumption: litres_per_day × 0.0003 kg CO₂/litre"""
    if not water:
        return 0.0
    litres_per_day = float(water.get("litres_per_day", 0))
    days = int(water.get("days", 1))
    return round(litres_per_day * WATER_FACTOR * days, 4)


def calculate_digital(digital: Optional[dict]) -> float:
    """
    Digital carbon footprint:
    - Video streaming: hours/month × 0.036 kg CO₂/hr
    - General screen time: hours/day × days × 0.025 kg CO₂/hr
    - AI queries: count × 0.004 kg CO₂/query
    """
    if not digital:
        return 0.0
    d = digital
    streaming_hours = float(d.get("streaming_hours_month", 0))
    screen_hours_day = float(d.get("screen_hours_day", 0))
    days = int(d.get("days", 30))
    ai_queries = float(d.get("ai_queries_month", 0))

    total = (
        streaming_hours * DIGITAL_FACTORS["streaming_hour"]
        + screen_hours_day * days * DIGITAL_FACTORS["screen_hour"]
        + ai_queries * DIGITAL_FACTORS["ai_query"]
    )
    return round(total, 4)


def calculate_shopping(shopping: Optional[dict]) -> float:
    """
    Shopping footprint: sum of (quantity × emission factor) per product type.
    Formula: trees_offset = total_CO₂ / 21 (1 tree absorbs ~21 kg/year)
    """
    if not shopping:
        return 0.0
    s = shopping
    total = sum(
        float(s.get(product, 0)) * factor
        for product, factor in SHOPPING_FACTORS.items()
    )
    return round(total, 4)


def get_eco_score(total_kg: float) -> tuple[int, str, str]:
    for threshold, score, level, rank in ECO_LEVELS:
        if total_kg <= threshold:
            return score, level, rank
    return 20, "Very High", "🔴 Critical Action Needed"


def calculate_carbon_score(total_kg: float, max_kg: float = 1000.0) -> int:
    """
    Carbon Score = 100 - (Total CO₂ / Maximum CO₂) × 100
    Score table: 90-100 Excellent | 75-89 Good | 50-74 Average | <50 Needs Improvement
    """
    if max_kg <= 0:
        return 0
    score = int(100 - (min(total_kg, max_kg) / max_kg) * 100)
    return max(0, min(100, score))


def generate_suggestions(
    transport_kg: float,
    energy_kg: float,
    food_kg: float,
    waste_kg: float,
    water_kg: float,
    digital_kg: float,
    shopping_kg: float,
    total_kg: float,
) -> List[str]:
    suggestions = []

    if transport_kg > 5:
        suggestions.append(
            "🚌 Switch to public transport 2×/week — save up to 15% on transport emissions."
        )
    if transport_kg > 10:
        suggestions.append(
            "✈️ One less long-haul flight saves ~0.5–2.5 tonnes CO₂ annually."
        )
        suggestions.append(
            "🚲 For trips under 5 km, cycling saves ~192g CO₂ per km vs. petrol car."
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
    if waste_kg > 2:
        suggestions.append(
            "♻️ Composting food waste prevents methane — 25× more potent than CO₂."
        )
    if water_kg > 0.5:
        suggestions.append(
            "💧 Fix leaky taps — a dripping tap wastes 5,500 litres/year, saving ~1.65 kg CO₂."
        )
        suggestions.append(
            "🚿 Cutting shower time by 2 min saves ~8 litres/day and 0.87 kg CO₂/year."
        )
    if digital_kg > 2:
        suggestions.append(
            "📱 Stream in SD instead of HD — reduces streaming emissions by up to 86%."
        )
        suggestions.append(
            "🖥️ Enable dark mode and reduce screen brightness — cuts display energy 20-30%."
        )
    if shopping_kg > 20:
        suggestions.append(
            "👗 Buy second-hand clothing — extends garment life and saves 70% of fashion emissions."
        )
        suggestions.append(
            "📱 Repair electronics instead of replacing — manufacturing is 80% of a phone's footprint."
        )
    if total_kg < 5:
        suggestions.append(
            "🌟 Excellent work! Consider offsetting remaining emissions via certified tree planting."
        )
    if not suggestions:
        suggestions.append(
            "📊 Keep tracking your activities to get personalized sustainability tips!"
        )

    return suggestions[:6]  # Cap at 6 suggestions


def calculate_carbon(
    transportation: Optional[List[dict]] = None,
    energy: Optional[dict] = None,
    food: Optional[dict] = None,
    waste: Optional[dict] = None,
    water: Optional[dict] = None,
    digital: Optional[dict] = None,
    shopping: Optional[dict] = None,
) -> EmissionResult:
    t_kg = calculate_transportation(transportation)
    e_kg = calculate_energy(energy)
    f_kg = calculate_food(food)
    w_kg = calculate_waste(waste)
    wat_kg = calculate_water(water)
    dig_kg = calculate_digital(digital)
    shp_kg = calculate_shopping(shopping)

    total = round(t_kg + e_kg + f_kg + w_kg + wat_kg + dig_kg + shp_kg, 4)
    eco_score, impact_level, rank = get_eco_score(total)
    carbon_score = calculate_carbon_score(total)
    suggestions = generate_suggestions(t_kg, e_kg, f_kg, w_kg, wat_kg, dig_kg, shp_kg, total)

    # Yearly projection (assumes input is daily/monthly, multiply by 365 or 12 as appropriate)
    yearly = round(total * 365, 2)

    # Trees to offset: 1 mature tree absorbs ~21 kg CO₂/year (user spec)
    trees = round(total * 365 / 21.0, 2) if total > 0 else 0

    # Equivalent car km at 0.192 kg/km
    cars_km = round(total / 0.192, 1) if total > 0 else 0

    return EmissionResult(
        total_emission_kg=total,
        transportation_kg=t_kg,
        energy_kg=e_kg,
        food_kg=f_kg,
        waste_kg=w_kg,
        water_kg=wat_kg,
        digital_kg=dig_kg,
        shopping_kg=shp_kg,
        eco_score=eco_score,
        impact_level=impact_level,
        sustainability_rank=rank,
        suggestions=suggestions,
        trees_equivalent=trees,
        cars_equivalent=cars_km,
        yearly_projection_kg=yearly,
        carbon_score=carbon_score,
    )
