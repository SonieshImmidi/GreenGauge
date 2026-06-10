"""
Personalized Recommendation Engine

Analyzes a user's carbon history and generates tailored sustainability tips.
"""

from typing import Dict, List

RECOMMENDATION_LIBRARY: Dict[str, List[dict]] = {
    "transportation": [
        {
            "title": "Go Car-Free One Day a Week",
            "tip": "Skipping the car just once a week can cut your transport emissions by 14% annually.",
            "impact": 14,
            "icon": "🚶",
        },
        {
            "title": "Try Electric Vehicles",
            "tip": "Switching from petrol to electric cuts per-km emissions by ~75% on average grid electricity.",
            "impact": 75,
            "icon": "⚡",
        },
        {
            "title": "Carpool to Work",
            "tip": "Sharing a commute with one colleague halves your per-person transport footprint.",
            "impact": 50,
            "icon": "🚗",
        },
        {
            "title": "Use Public Transport",
            "tip": "Taking the bus instead of driving saves ~89g CO₂ per km vs. 210g for a petrol car.",
            "impact": 58,
            "icon": "🚌",
        },
        {
            "title": "Combine Errands",
            "tip": "Planning trips efficiently can reduce driving distance by up to 20%.",
            "impact": 20,
            "icon": "🗺️",
        },
        {
            "title": "Consider Train Over Flights",
            "tip": "A train journey emits ~6× less CO₂ per km than a domestic flight.",
            "impact": 83,
            "icon": "🚆",
        },
    ],
    "energy": [
        {
            "title": "Switch to LED Lighting",
            "tip": "LED bulbs use 75% less energy and last 25× longer than incandescent bulbs.",
            "impact": 75,
            "icon": "💡",
        },
        {
            "title": "Install a Smart Thermostat",
            "tip": "Smart thermostats can reduce heating/cooling bills by 10–12%.",
            "impact": 12,
            "icon": "🌡️",
        },
        {
            "title": "Use Renewable Energy",
            "tip": "Switching to a green energy tariff can eliminate your electricity emissions.",
            "impact": 100,
            "icon": "☀️",
        },
        {
            "title": "Unplug Standby Devices",
            "tip": "Standby power accounts for ~10% of home electricity use. Unplug when not in use.",
            "impact": 10,
            "icon": "🔌",
        },
        {
            "title": "Upgrade to Energy-Efficient Appliances",
            "tip": "A-rated appliances can be 40% more efficient than older models.",
            "impact": 40,
            "icon": "🏠",
        },
    ],
    "food": [
        {
            "title": "Try Meatless Mondays",
            "tip": "One meat-free day per week reduces annual food emissions by ~52 kg CO₂.",
            "impact": 15,
            "icon": "🥗",
        },
        {
            "title": "Go Plant-Based More Often",
            "tip": "A vegan diet produces ~50% less CO₂ than a meat-heavy diet.",
            "impact": 50,
            "icon": "🌱",
        },
        {
            "title": "Buy Local & Seasonal Produce",
            "tip": "Local food cuts transport emissions by up to 50% and supports local farmers.",
            "impact": 50,
            "icon": "🛒",
        },
        {
            "title": "Reduce Food Waste",
            "tip": "~8% of global emissions come from food waste. Plan meals and store food properly.",
            "impact": 8,
            "icon": "🍎",
        },
    ],
    "waste": [
        {
            "title": "Start Composting",
            "tip": "Composting food scraps prevents methane — 25× more potent than CO₂.",
            "impact": 25,
            "icon": "🌿",
        },
        {
            "title": "Maximize Recycling",
            "tip": "Recycling aluminium uses 95% less energy than producing it from raw materials.",
            "impact": 95,
            "icon": "♻️",
        },
        {
            "title": "Switch to Reusables",
            "tip": "A reusable bag offsets its carbon footprint after just 11 uses vs. plastic bags.",
            "impact": 30,
            "icon": "🛍️",
        },
        {
            "title": "Repair Instead of Replace",
            "tip": "Manufacturing new electronics accounts for 80% of their lifetime emissions.",
            "impact": 80,
            "icon": "🔧",
        },
    ],
    "lifestyle": [
        {
            "title": "Plant a Tree",
            "tip": "A mature tree absorbs ~21.7 kg CO₂ per year. Plant 10 to offset a tonne annually.",
            "impact": 5,
            "icon": "🌳",
        },
        {
            "title": "Buy Second-Hand",
            "tip": "Buying used clothing cuts fashion's carbon footprint by up to 82%.",
            "impact": 82,
            "icon": "👕",
        },
        {
            "title": "Work From Home",
            "tip": "Remote work 2 days a week can reduce commute emissions by 40%.",
            "impact": 40,
            "icon": "🏡",
        },
    ],
}


def get_recommendations_for_profile(
    top_category: str,
    total_kg: float,
    user_id: str,
) -> List[dict]:
    """Return prioritized recommendations based on top emission category."""
    primary = RECOMMENDATION_LIBRARY.get(top_category, [])
    lifestyle = RECOMMENDATION_LIBRARY["lifestyle"]

    # Sort by impact
    primary_sorted = sorted(primary, key=lambda x: x["impact"], reverse=True)

    # Mix in lifestyle tips
    combined = primary_sorted[:4] + lifestyle[:2]

    # Add urgency label
    urgency = "High Priority" if total_kg > 10 else "Recommended"
    for rec in combined:
        rec["urgency"] = urgency

    return combined
