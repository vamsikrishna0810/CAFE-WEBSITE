import json

from sqlalchemy import select

from .db import SessionLocal
from .models import CafeSettings, MenuItem

DEFAULT_HOURS = [
    {"day": day, "is_closed": True, "opens_at": "", "closes_at": ""}
    for day in ("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
]
DEMO_MENU = [
    ("Strawberry shortcake", "Bakes & cake", "Soft sponge, berries and a cloud of cream", 35000),
    ("Chocolate cherry slice", "Bakes & cake", "Rich chocolate and bright cherry", 32000),
    ("Cinnamon sugar knots", "Bakes & cake", "Warm pull-apart bites with cinnamon sugar", 18000),
    ("Vanilla latte", "Coffee & sips", "Espresso, silky milk and a hint of vanilla", 22000),
    ("Iced strawberry matcha", "Coffee & sips", "Cool matcha with a strawberry swirl", 26000),
    ("Tomato & cheese toastie", "Little bites", "Crisp-edged and melty", 28000),
]


def seed_demo_data() -> None:
    with SessionLocal() as session:
        if session.get(CafeSettings, 1) is None:
            session.add(CafeSettings(
                id=1,
                display_name="SUGAR_RUSH (demo)",
                tagline="A little joy, by the slice.",
                phone="",
                email="",
                address="",
                map_url="",
                about_text="SUGAR_RUSH is a cheerful cafe concept built around a simple idea: make ordinary days a little sweeter.",
                announcement_text="Cafe · bakery · sweet little things",
                instagram_url="",
                facebook_url="",
                timezone="Asia/Kolkata",
                currency_code="INR",
                opening_hours_json=json.dumps(DEFAULT_HOURS),
                is_demo_data=True,
            ))
        if session.scalar(select(MenuItem.id).limit(1)) is None:
            for name, category, description, price_minor in DEMO_MENU:
                session.add(MenuItem(
                    name=name,
                    category=category,
                    description=description,
                    price_minor=price_minor,
                    is_available=False,
                    is_featured=False,
                    is_demo_data=True,
                ))
        session.commit()


if __name__ == "__main__":
    seed_demo_data()
    print("Demo cafe data is ready (items remain unavailable until you review them).")
