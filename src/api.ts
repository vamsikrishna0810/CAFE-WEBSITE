export interface MenuItem {
  id: number;
  name: string;
  category: string;
  description: string;
  price_minor: number;
  is_available: boolean;
  is_featured: boolean;
  is_demo_data: boolean;
}

export interface OpeningHour {
  day: string;
  is_closed: boolean;
  opens_at: string;
  closes_at: string;
}

export interface CafeSettings {
  id: number;
  display_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  map_url: string;
  about_text: string;
  announcement_text: string;
  instagram_url: string;
  facebook_url: string;
  timezone: string;
  currency_code: string;
  opening_hours: OpeningHour[];
  is_demo_data: boolean;
}

export interface CafeEvent {
  id: number;
  title: string;
  description: string;
  starts_at: string;
  is_published: boolean;
  is_demo_data: boolean;
}

export interface AdminSummary {
  menu_items: number;
  available_items: number;
  events: number;
  mode: "local_demo";
}

export interface PublicMenu {
  items: MenuItem[];
  currency_code: string;
  is_demo_data: boolean;
}

export type MenuItemInput = Omit<MenuItem, "id">;
export type CafeSettingsInput = Omit<CafeSettings, "id">;
export type CafeEventInput = Omit<CafeEvent, "id">;

const API_BASE = (import.meta.env.VITE_CAFE_API_BASE_URL || "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
const TOKEN_KEY = "cafe-admin-token";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const token = sessionStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json() as { detail?: string };
      if (body.detail) message = body.detail;
    } catch { /* keep the status message */ }
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function apiLogin(password: string) {
  return request<{ access_token: string }>("/auth/login", {
    method: "POST", body: JSON.stringify({ password }),
  }, false);
}

export function apiLogout() {
  return request<void>("/auth/logout", { method: "POST" });
}

export const saveToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => sessionStorage.removeItem(TOKEN_KEY);
export const hasToken = () => Boolean(sessionStorage.getItem(TOKEN_KEY));

export const getSummary = () => request<AdminSummary>("/admin/summary");
export const getMenuItems = () => request<MenuItem[]>("/admin/menu-items");
export const createMenuItem = (value: MenuItemInput) => request<MenuItem>("/admin/menu-items", {
  method: "POST", body: JSON.stringify(value),
});
export const updateMenuItem = (id: number, value: MenuItemInput) => request<MenuItem>(`/admin/menu-items/${id}`, {
  method: "PUT", body: JSON.stringify(value),
});
export const archiveMenuItem = (id: number) => request<void>(`/admin/menu-items/${id}`, { method: "DELETE" });

export const getSettings = () => request<CafeSettings>("/admin/settings");
export const updateSettings = (value: CafeSettingsInput) => request<CafeSettings>("/admin/settings", {
  method: "PUT", body: JSON.stringify(value),
});

export const getEvents = () => request<CafeEvent[]>("/admin/events");
export const getPublicEvents = () => request<CafeEvent[]>("/public/events", {}, false);
export const createEvent = (value: CafeEventInput) => request<CafeEvent>("/admin/events", {
  method: "POST", body: JSON.stringify(value),
});
export const updateEvent = (id: number, value: CafeEventInput) => request<CafeEvent>(`/admin/events/${id}`, {
  method: "PUT", body: JSON.stringify(value),
});
export const archiveEvent = (id: number) => request<void>(`/admin/events/${id}`, { method: "DELETE" });

export const getPublicMenu = () => request<PublicMenu>("/public/menu", {}, false);
export const getPublicSite = () => request<CafeSettings>("/public/site", {}, false);
