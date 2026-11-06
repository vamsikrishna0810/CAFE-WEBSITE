from datetime import datetime, timezone

from sqlalchemy import Boolean, CheckConstraint, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MenuItem(Base):
    __tablename__ = "menu_items"
    __table_args__ = (CheckConstraint("price_minor >= 0", name="ck_menu_price_nonnegative"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    price_minor: Mapped[int] = mapped_column(Integer, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_demo_data: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now, nullable=False)


class CafeSettings(Base):
    __tablename__ = "cafe_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    tagline: Mapped[str] = mapped_column(String(240), default="", nullable=False)
    phone: Mapped[str] = mapped_column(String(40), default="", nullable=False)
    email: Mapped[str] = mapped_column(String(254), default="", nullable=False)
    address: Mapped[str] = mapped_column(String(500), default="", nullable=False)
    map_url: Mapped[str] = mapped_column(String(1000), default="", nullable=False)
    about_text: Mapped[str] = mapped_column(Text, default="", nullable=False)
    announcement_text: Mapped[str] = mapped_column(String(240), default="", nullable=False)
    instagram_url: Mapped[str] = mapped_column(String(1000), default="", nullable=False)
    facebook_url: Mapped[str] = mapped_column(String(1000), default="", nullable=False)
    timezone: Mapped[str] = mapped_column(String(80), default="Asia/Kolkata", nullable=False)
    currency_code: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    opening_hours_json: Mapped[str] = mapped_column(Text, nullable=False)
    is_demo_data: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utc_now, onupdate=utc_now, nullable=False)


class CafeEvent(Base):
    __tablename__ = "cafe_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str] = mapped_column(String(1000), default="", nullable=False)
    starts_at: Mapped[str] = mapped_column(String(40), default="", nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_demo_data: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
