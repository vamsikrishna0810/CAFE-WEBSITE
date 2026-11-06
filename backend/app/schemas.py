from pydantic import BaseModel, ConfigDict, Field


class MenuItemInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    description: str = Field(default="", max_length=500)
    price_minor: int = Field(ge=0, le=100_000_000)
    is_available: bool = True
    is_featured: bool = False
    is_demo_data: bool = True


class MenuItemView(MenuItemInput):
    model_config = ConfigDict(from_attributes=True)

    id: int


class OpeningHour(BaseModel):
    day: str = Field(min_length=1, max_length=12)
    is_closed: bool = True
    opens_at: str = ""
    closes_at: str = ""


class CafeSettingsInput(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)
    tagline: str = Field(default="", max_length=240)
    phone: str = Field(default="", max_length=40)
    email: str = Field(default="", max_length=254)
    address: str = Field(default="", max_length=500)
    map_url: str = Field(default="", max_length=1000)
    about_text: str = Field(default="", max_length=2000)
    announcement_text: str = Field(default="", max_length=240)
    instagram_url: str = Field(default="", max_length=1000)
    facebook_url: str = Field(default="", max_length=1000)
    timezone: str = Field(default="Asia/Kolkata", max_length=80)
    currency_code: str = Field(default="INR", pattern=r"^[A-Z]{3}$")
    opening_hours: list[OpeningHour]
    is_demo_data: bool = True


class CafeSettingsView(CafeSettingsInput):
    model_config = ConfigDict(from_attributes=True)

    id: int


class PublicMenuView(BaseModel):
    items: list[MenuItemView]
    currency_code: str
    is_demo_data: bool


class EventInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    description: str = Field(default="", max_length=1000)
    starts_at: str = Field(default="", max_length=40)
    is_published: bool = False
    is_demo_data: bool = True


class EventView(EventInput):
    model_config = ConfigDict(from_attributes=True)

    id: int


class LoginInput(BaseModel):
    password: str = Field(min_length=1, max_length=200)


class LoginView(BaseModel):
    access_token: str
    token_type: str = "bearer"
