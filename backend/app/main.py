import json
import os
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .db import BACKEND_DIR, get_db
from .models import CafeEvent, CafeSettings, MenuItem
from .schemas import (
    CafeSettingsInput,
    CafeSettingsView,
    EventInput,
    EventView,
    LoginInput,
    LoginView,
    MenuItemInput,
    MenuItemView,
    PublicMenuView,
)
from .security import create_access_token, require_admin, verify_admin_password

load_dotenv(BACKEND_DIR / ".env")
API_PREFIX = "/api/v1"


app = FastAPI(title="Cafe Admin API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("FRONTEND_ORIGIN", "http://localhost:5173,http://127.0.0.1:5173").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


def settings_view(settings: CafeSettings) -> CafeSettingsView:
    return CafeSettingsView(
        id=settings.id,
        display_name=settings.display_name,
        tagline=settings.tagline,
        phone=settings.phone,
        email=settings.email,
        address=settings.address,
        map_url=settings.map_url,
        about_text=settings.about_text,
        announcement_text=settings.announcement_text,
        instagram_url=settings.instagram_url,
        facebook_url=settings.facebook_url,
        timezone=settings.timezone,
        currency_code=settings.currency_code,
        opening_hours=json.loads(settings.opening_hours_json),
        is_demo_data=settings.is_demo_data,
    )


@app.get(f"{API_PREFIX}/health")
def health():
    return {"status": "ok", "service": "cafe-admin-api"}


@app.post(f"{API_PREFIX}/auth/login", response_model=LoginView)
def login(credentials: LoginInput):
    if not verify_admin_password(credentials.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    return LoginView(access_token=create_access_token())


@app.post(f"{API_PREFIX}/auth/logout", dependencies=[Depends(require_admin)])
def logout():
    return {"status": "signed_out"}


@app.get(f"{API_PREFIX}/admin/summary", dependencies=[Depends(require_admin)])
def admin_summary(db: Session = Depends(get_db)):
    return {
        "menu_items": db.scalar(select(func.count()).select_from(MenuItem).where(MenuItem.is_archived.is_(False))) or 0,
        "available_items": db.scalar(select(func.count()).select_from(MenuItem).where(
            MenuItem.is_available.is_(True), MenuItem.is_archived.is_(False)
        )) or 0,
        "events": db.scalar(select(func.count()).select_from(CafeEvent).where(CafeEvent.is_archived.is_(False))) or 0,
        "mode": "local_demo",
    }


@app.get(f"{API_PREFIX}/public/site", response_model=CafeSettingsView)
def public_site(db: Session = Depends(get_db)):
    settings = db.get(CafeSettings, 1)
    if settings is None:
        raise HTTPException(status_code=503, detail="Cafe profile is not configured")
    return settings_view(settings)


@app.get(f"{API_PREFIX}/public/menu", response_model=PublicMenuView)
def public_menu(db: Session = Depends(get_db)):
    items = list(db.scalars(select(MenuItem).where(
        MenuItem.is_available.is_(True), MenuItem.is_archived.is_(False)
    ).order_by(MenuItem.category, MenuItem.name)))
    settings = db.get(CafeSettings, 1)
    return PublicMenuView(
        items=items,
        currency_code=settings.currency_code if settings else "INR",
        is_demo_data=(settings is None or settings.is_demo_data or any(item.is_demo_data for item in items)),
    )


@app.get(f"{API_PREFIX}/public/events", response_model=list[EventView])
def public_events(db: Session = Depends(get_db)):
    return list(db.scalars(select(CafeEvent).where(
        CafeEvent.is_published.is_(True), CafeEvent.is_archived.is_(False)
    ).order_by(CafeEvent.starts_at)))


@app.get(f"{API_PREFIX}/admin/menu-items", response_model=list[MenuItemView], dependencies=[Depends(require_admin)])
def list_menu_items(db: Session = Depends(get_db)):
    return list(db.scalars(select(MenuItem).where(MenuItem.is_archived.is_(False)).order_by(
        MenuItem.category, MenuItem.name
    )))


@app.post(f"{API_PREFIX}/admin/menu-items", response_model=MenuItemView, status_code=201, dependencies=[Depends(require_admin)])
def create_menu_item(payload: MenuItemInput, db: Session = Depends(get_db)):
    item = MenuItem(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.put(f"{API_PREFIX}/admin/menu-items/{{item_id}}", response_model=MenuItemView, dependencies=[Depends(require_admin)])
def update_menu_item(item_id: int, payload: MenuItemInput, db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if item is None or item.is_archived:
        raise HTTPException(status_code=404, detail="Menu item not found")
    for key, value in payload.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete(f"{API_PREFIX}/admin/menu-items/{{item_id}}", status_code=204, dependencies=[Depends(require_admin)])
def archive_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.get(MenuItem, item_id)
    if item is None or item.is_archived:
        raise HTTPException(status_code=404, detail="Menu item not found")
    item.is_archived = True
    db.commit()


@app.get(f"{API_PREFIX}/admin/settings", response_model=CafeSettingsView, dependencies=[Depends(require_admin)])
def get_settings(db: Session = Depends(get_db)):
    settings = db.get(CafeSettings, 1)
    if settings is None:
        raise HTTPException(status_code=503, detail="Run the demo data seed command first")
    return settings_view(settings)


@app.put(f"{API_PREFIX}/admin/settings", response_model=CafeSettingsView, dependencies=[Depends(require_admin)])
def update_settings(payload: CafeSettingsInput, db: Session = Depends(get_db)):
    settings = db.get(CafeSettings, 1)
    if settings is None:
        settings = CafeSettings(id=1, opening_hours_json="[]", **payload.model_dump(exclude={"opening_hours"}))
        db.add(settings)
    for key, value in payload.model_dump(exclude={"opening_hours"}).items():
        setattr(settings, key, value)
    settings.opening_hours_json = json.dumps([hour.model_dump() for hour in payload.opening_hours])
    db.commit()
    db.refresh(settings)
    return settings_view(settings)


@app.get(f"{API_PREFIX}/admin/events", response_model=list[EventView], dependencies=[Depends(require_admin)])
def list_events(db: Session = Depends(get_db)):
    return list(db.scalars(select(CafeEvent).where(CafeEvent.is_archived.is_(False)).order_by(CafeEvent.id.desc())))


@app.post(f"{API_PREFIX}/admin/events", response_model=EventView, status_code=201, dependencies=[Depends(require_admin)])
def create_event(payload: EventInput, db: Session = Depends(get_db)):
    event = CafeEvent(**payload.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@app.put(f"{API_PREFIX}/admin/events/{{event_id}}", response_model=EventView, dependencies=[Depends(require_admin)])
def update_event(event_id: int, payload: EventInput, db: Session = Depends(get_db)):
    event = db.get(CafeEvent, event_id)
    if event is None or event.is_archived:
        raise HTTPException(status_code=404, detail="Event not found")
    for key, value in payload.model_dump().items():
        setattr(event, key, value)
    db.commit()
    db.refresh(event)
    return event


@app.delete(f"{API_PREFIX}/admin/events/{{event_id}}", status_code=204, dependencies=[Depends(require_admin)])
def archive_event(event_id: int, db: Session = Depends(get_db)):
    event = db.get(CafeEvent, event_id)
    if event is None or event.is_archived:
        raise HTTPException(status_code=404, detail="Event not found")
    event.is_archived = True
    db.commit()
