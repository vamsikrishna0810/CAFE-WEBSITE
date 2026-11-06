import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  apiLogin,
  apiLogout,
  archiveEvent,
  archiveMenuItem,
  clearToken,
  createEvent,
  createMenuItem,
  getEvents,
  getMenuItems,
  getSettings,
  getSummary,
  hasToken,
  saveToken,
  updateEvent,
  updateMenuItem,
  updateSettings,
  type AdminSummary,
  type CafeEvent,
  type CafeEventInput,
  type CafeSettings,
  type MenuItem,
  type MenuItemInput,
  type OpeningHour,
} from "../api";

type Tab = "Overview" | "Menu" | "Website & hours" | "Events" | "Reservations";
type MenuDraft = Omit<MenuItemInput, "price_minor"> & { price: string };
type EventDraft = Omit<CafeEventInput, "is_demo_data">;

function emptyMenuDraft(): MenuDraft {
  return { name: "", category: "Bakes & cake", description: "", price: "", is_available: false, is_featured: false, is_demo_data: true };
}

function emptyEventDraft(): EventDraft {
  return { title: "", description: "", starts_at: "", is_published: false };
}

function minorUnitFactor(code = "INR") {
  try {
    return 10 ** new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits;
  } catch {
    return 100;
  }
}

function formatMoney(minor: number, code = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: code }).format(minor / minorUnitFactor(code));
  } catch {
    return `${code} ${(minor / 100).toFixed(2)}`;
  }
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await apiLogin(password);
      saveToken(result.access_token);
      onLogin();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in. Start the local API and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="admin-login-shell">
    <form className="admin-login-card" onSubmit={submit}>
      <span className="admin-eyebrow">SUGAR_RUSH · local admin</span>
      <h1>Welcome back.</h1>
      <p>Sign in to edit the demo menu, cafe details, opening hours and events.</p>
      <label className="admin-field">Admin password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="admin-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      <small>Local development panel · changes are saved to this computer's SQLite database.</small>
    </form>
  </main>;
}

export default function AdminPage() {
  const [signedIn, setSignedIn] = useState(hasToken);
  const [tab, setTab] = useState<Tab>("Overview");
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<CafeSettings | null>(null);
  const [events, setEvents] = useState<CafeEvent[]>([]);
  const [menuDraft, setMenuDraft] = useState<MenuDraft>(emptyMenuDraft);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [eventDraft, setEventDraft] = useState<EventDraft>(emptyEventDraft);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextSummary, nextItems, nextSettings, nextEvents] = await Promise.all([
        getSummary(), getMenuItems(), getSettings(), getEvents(),
      ]);
      setSummary(nextSummary);
      setItems(nextItems);
      setSettings(nextSettings);
      setEvents(nextEvents);
    } catch (reason) {
      if (reason && typeof reason === "object" && "status" in reason && reason.status === 401) {
        clearToken();
        setSignedIn(false);
      }
      setError(reason instanceof Error ? reason.message : "Could not load admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (signedIn) void refresh();
  }, [refresh, signedIn]);

  async function signOut() {
    try { await apiLogout(); } catch { /* local token is removed even if the API stopped */ }
    clearToken();
    setSignedIn(false);
  }

  async function submitMenu(event: FormEvent) {
    event.preventDefault();
    const amount = Number(menuDraft.price);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
      setError("Enter a valid price between 0 and 1,000,000.");
      return;
    }
    const payload: MenuItemInput = {
      name: menuDraft.name.trim(), category: menuDraft.category.trim(), description: menuDraft.description.trim(),
      price_minor: Math.round(amount * minorUnitFactor(settings?.currency_code)), is_available: menuDraft.is_available,
      is_featured: menuDraft.is_featured, is_demo_data: menuDraft.is_demo_data,
    };
    setSaving(true); setError(""); setNotice("");
    try {
      if (editingMenuId === null) await createMenuItem(payload);
      else await updateMenuItem(editingMenuId, payload);
      setMenuDraft(emptyMenuDraft()); setEditingMenuId(null);
      setNotice("Menu item saved."); await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save menu item.");
    } finally { setSaving(false); }
  }

  function editMenu(item: MenuItem) {
    setMenuDraft({ ...item, price: (item.price_minor / minorUnitFactor(settings?.currency_code)).toFixed(2) });
    setEditingMenuId(item.id);
  }

  async function removeMenu(item: MenuItem) {
    if (!window.confirm(`Archive “${item.name}”? It will disappear from the public menu.`)) return;
    try { await archiveMenuItem(item.id); setNotice("Menu item archived."); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not archive menu item."); }
  }

  async function saveCafeSettings(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true); setError(""); setNotice("");
    try { setSettings(await updateSettings(settings)); setNotice("Cafe details and opening hours saved."); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save cafe settings."); }
    finally { setSaving(false); }
  }

  async function submitEvent(event: FormEvent) {
    event.preventDefault();
    const payload: CafeEventInput = { ...eventDraft, is_demo_data: true };
    setSaving(true); setError(""); setNotice("");
    try {
      if (editingEventId === null) await createEvent(payload);
      else await updateEvent(editingEventId, payload);
      setEventDraft(emptyEventDraft()); setEditingEventId(null); setNotice("Event saved."); await refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not save event."); }
    finally { setSaving(false); }
  }

  async function removeEvent(item: CafeEvent) {
    if (!window.confirm(`Archive “${item.title}”?`)) return;
    try { await archiveEvent(item.id); setNotice("Event archived."); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not archive event."); }
  }

  function updateHour(index: number, key: keyof OpeningHour, value: string | boolean) {
    if (!settings) return;
    const hours = settings.opening_hours.map((hour, current) => current === index ? { ...hour, [key]: value } : hour);
    setSettings({ ...settings, opening_hours: hours });
  }

  if (!signedIn) return <Login onLogin={() => setSignedIn(true)} />;

  const tabs: Tab[] = ["Overview", "Menu", "Website & hours", "Events", "Reservations"];
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/">SUGAR_RUSH <span>ADMIN</span></a>
      <p className="admin-sidebar-label">WORKSPACE</p>
      <nav className="admin-nav" aria-label="Admin sections">
        {tabs.map((item) => <button key={item} className={tab === item ? "is-active" : ""} onClick={() => { setTab(item); setNotice(""); setError(""); }}>{item}</button>)}
      </nav>
      <div className="admin-sidebar-bottom"><span>Local development</span><button onClick={() => void signOut()}>Sign out</button></div>
    </aside>

    <main className="admin-main">
      <header className="admin-topbar"><div><span className="admin-eyebrow">CAFE MANAGEMENT</span><h1>{tab}</h1></div><div className="admin-topbar-actions"><span className="admin-demo-pill">DEMO DATA</span><button className="admin-quiet-button" onClick={() => void refresh()} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button><button className="admin-quiet-button" onClick={() => void signOut()}>Sign out</button></div></header>
      <div className="admin-demo-banner"><b>Local demo workspace</b><span>Edits save to a local database. Replace the demo menu, prices, hours and contact fields with verified cafe details before using them publicly.</span></div>
      {notice && <p className="admin-notice" role="status">{notice}</p>}
      {error && <p className="admin-error admin-error-box" role="alert">{error}</p>}

      {tab === "Overview" && <section className="admin-content">
        <div className="admin-stat-grid">
          <article className="admin-stat"><span>Menu items</span><strong>{summary?.menu_items ?? "—"}</strong><small>Including unavailable demo items</small></article>
          <article className="admin-stat"><span>Available now</span><strong>{summary?.available_items ?? "—"}</strong><small>Only these can appear on the public menu</small></article>
          <article className="admin-stat"><span>Events</span><strong>{summary?.events ?? "—"}</strong><small>Drafts and published entries</small></article>
        </div>
        <div className="admin-panel admin-welcome"><span className="admin-eyebrow">YOUR NEXT STEPS</span><h2>Make this workspace yours.</h2><p>Start by replacing the sample menu and price values, then add the verified venue details and opening hours. Menu items stay hidden until you mark them available.</p><div className="admin-inline-actions"><button className="admin-primary" onClick={() => setTab("Menu")}>Manage menu</button><button className="admin-secondary" onClick={() => setTab("Website & hours")}>Edit cafe details</button></div></div>
        <p className="admin-footnote">Reservation requests are disabled until booking rules and a real booking flow are configured.</p>
      </section>}

      {tab === "Menu" && <section className="admin-content admin-menu-layout">
        <form className="admin-panel admin-form" onSubmit={submitMenu}>
          <div className="admin-panel-head"><div><span className="admin-eyebrow">MENU CATALOG</span><h2>{editingMenuId === null ? "Add a menu item" : "Edit menu item"}</h2></div>{editingMenuId !== null && <button type="button" className="admin-text-button" onClick={() => { setEditingMenuId(null); setMenuDraft(emptyMenuDraft()); }}>Cancel edit</button>}</div>
          <div className="admin-form-grid">
            <label className="admin-field">Item name<input value={menuDraft.name} onChange={(event) => setMenuDraft({ ...menuDraft, name: event.target.value })} required maxLength={120} /></label>
            <label className="admin-field">Category<input value={menuDraft.category} onChange={(event) => setMenuDraft({ ...menuDraft, category: event.target.value })} required maxLength={80} /></label>
            <label className="admin-field">Price ({settings?.currency_code || "INR"})<input type="number" min="0" max="1000000" step={1 / minorUnitFactor(settings?.currency_code)} value={menuDraft.price} onChange={(event) => setMenuDraft({ ...menuDraft, price: event.target.value })} required /></label>
            <label className="admin-field admin-field-wide">Description<textarea rows={3} value={menuDraft.description} onChange={(event) => setMenuDraft({ ...menuDraft, description: event.target.value })} maxLength={500} /></label>
          </div>
          <div className="admin-checkbox-row"><label><input type="checkbox" checked={menuDraft.is_available} onChange={(event) => setMenuDraft({ ...menuDraft, is_available: event.target.checked })} /> Available on public menu</label><label><input type="checkbox" checked={menuDraft.is_featured} onChange={(event) => setMenuDraft({ ...menuDraft, is_featured: event.target.checked })} /> Feature this item</label><label><input type="checkbox" checked={menuDraft.is_demo_data} onChange={(event) => setMenuDraft({ ...menuDraft, is_demo_data: event.target.checked })} /> Demo data</label></div>
          <button className="admin-primary" disabled={saving}>{saving ? "Saving…" : editingMenuId === null ? "Add item" : "Save changes"}</button>
        </form>
        <div className="admin-panel admin-table-panel"><div className="admin-panel-head"><div><span className="admin-eyebrow">CURRENT ITEMS</span><h2>Menu</h2></div><span className="admin-count">{items.length} items</span></div>
          <div className="admin-menu-list">{items.map((item) => <article className="admin-menu-row" key={item.id}><div className="admin-item-copy"><b>{item.name}</b><span>{item.category} · {formatMoney(item.price_minor, settings?.currency_code)}</span><div className="admin-row-tags"><span className={item.is_available ? "tag-live" : "tag-muted"}>{item.is_available ? "Available" : "Hidden"}</span>{item.is_demo_data && <span className="tag-demo">Demo</span>}</div></div><div className="admin-row-actions"><button className="admin-text-button" onClick={() => editMenu(item)}>Edit</button><button className="admin-text-button danger" onClick={() => void removeMenu(item)}>Archive</button></div></article>)}{!items.length && <p className="admin-empty">No items yet. Add your first menu item above.</p>}</div>
        </div>
      </section>}

      {tab === "Website & hours" && settings && <section className="admin-content"><form className="admin-panel admin-form" onSubmit={saveCafeSettings}>
        <div className="admin-panel-head"><div><span className="admin-eyebrow">PUBLIC CAFE PROFILE</span><h2>Website details</h2></div><span className="tag-demo">{settings.is_demo_data ? "Demo content" : "Owner content"}</span></div>
        <div className="admin-form-grid">
          <label className="admin-field">Cafe name<input value={settings.display_name} onChange={(event) => setSettings({ ...settings, display_name: event.target.value })} required maxLength={120} /></label>
          <label className="admin-field">Tagline<input value={settings.tagline} onChange={(event) => setSettings({ ...settings, tagline: event.target.value })} maxLength={240} /></label>
          <label className="admin-field">Phone<input type="tel" value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} maxLength={40} /></label>
          <label className="admin-field">Email<input type="email" value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })} maxLength={254} /></label>
          <label className="admin-field admin-field-wide">Homepage announcement<input value={settings.announcement_text} onChange={(event) => setSettings({ ...settings, announcement_text: event.target.value })} maxLength={240} /></label>
          <label className="admin-field admin-field-wide">About / story text<textarea rows={4} value={settings.about_text} onChange={(event) => setSettings({ ...settings, about_text: event.target.value })} maxLength={2000} /></label>
          <label className="admin-field admin-field-wide">Address<textarea rows={2} value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} maxLength={500} /></label>
          <label className="admin-field admin-field-wide">Map link<input type="url" value={settings.map_url} onChange={(event) => setSettings({ ...settings, map_url: event.target.value })} maxLength={1000} placeholder="https://…" /></label>
          <label className="admin-field">Instagram URL<input type="url" value={settings.instagram_url} onChange={(event) => setSettings({ ...settings, instagram_url: event.target.value })} maxLength={1000} placeholder="https://…" /></label>
          <label className="admin-field">Facebook URL<input type="url" value={settings.facebook_url} onChange={(event) => setSettings({ ...settings, facebook_url: event.target.value })} maxLength={1000} placeholder="https://…" /></label>
          <label className="admin-field">Timezone<input value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })} required maxLength={80} /></label>
          <label className="admin-field">Currency code<input value={settings.currency_code} onChange={(event) => setSettings({ ...settings, currency_code: event.target.value.toUpperCase() })} required pattern="[A-Z]{3}" maxLength={3} /></label>
        </div>
        <label className="admin-checkbox"><input type="checkbox" checked={settings.is_demo_data} onChange={(event) => setSettings({ ...settings, is_demo_data: event.target.checked })} /> These are demo values</label>
        <div className="admin-divider" />
        <div className="admin-panel-head"><div><span className="admin-eyebrow">VISIT PLANNING</span><h2>Opening hours</h2></div></div>
        <div className="admin-hours-list">{settings.opening_hours.map((hour, index) => <div className="admin-hour-row" key={hour.day}><b>{hour.day}</b><label className="admin-checkbox"><input type="checkbox" checked={hour.is_closed} onChange={(event) => updateHour(index, "is_closed", event.target.checked)} /> Closed</label><input aria-label={`${hour.day} opening time`} type="time" disabled={hour.is_closed} value={hour.opens_at} onChange={(event) => updateHour(index, "opens_at", event.target.value)} /><span>to</span><input aria-label={`${hour.day} closing time`} type="time" disabled={hour.is_closed} value={hour.closes_at} onChange={(event) => updateHour(index, "closes_at", event.target.value)} /></div>)}</div>
        <button className="admin-primary" disabled={saving}>{saving ? "Saving…" : "Save website details"}</button>
      </form></section>}

      {tab === "Events" && <section className="admin-content admin-menu-layout">
        <form className="admin-panel admin-form" onSubmit={submitEvent}><div className="admin-panel-head"><div><span className="admin-eyebrow">SITE CONTENT</span><h2>{editingEventId === null ? "Add an event" : "Edit event"}</h2></div>{editingEventId !== null && <button type="button" className="admin-text-button" onClick={() => { setEditingEventId(null); setEventDraft(emptyEventDraft()); }}>Cancel</button>}</div>
          <label className="admin-field">Event title<input value={eventDraft.title} onChange={(event) => setEventDraft({ ...eventDraft, title: event.target.value })} required maxLength={160} /></label>
          <label className="admin-field">Description<textarea rows={4} value={eventDraft.description} onChange={(event) => setEventDraft({ ...eventDraft, description: event.target.value })} maxLength={1000} /></label>
          <label className="admin-field">Start date and time<input type="datetime-local" value={eventDraft.starts_at} onChange={(event) => setEventDraft({ ...eventDraft, starts_at: event.target.value })} /></label>
          <label className="admin-checkbox"><input type="checkbox" checked={eventDraft.is_published} onChange={(event) => setEventDraft({ ...eventDraft, is_published: event.target.checked })} /> Publish event</label>
          <button className="admin-primary" disabled={saving}>{saving ? "Saving…" : "Save event"}</button>
        </form>
        <div className="admin-panel admin-table-panel"><div className="admin-panel-head"><div><span className="admin-eyebrow">EVENT CALENDAR</span><h2>Events</h2></div></div>
          {events.map((item) => <article className="admin-event-row" key={item.id}><div><b>{item.title}</b><p>{item.starts_at || "Date not set"}</p><span className={item.is_published ? "tag-live" : "tag-muted"}>{item.is_published ? "Published" : "Draft"}</span></div><div className="admin-row-actions"><button className="admin-text-button" onClick={() => { setEventDraft(item); setEditingEventId(item.id); }}>Edit</button><button className="admin-text-button danger" onClick={() => void removeEvent(item)}>Archive</button></div></article>)}
          {!events.length && <p className="admin-empty">No events have been added.</p>}
        </div>
      </section>}

      {tab === "Reservations" && <section className="admin-content"><div className="admin-panel admin-reservations"><span className="admin-eyebrow">RESERVATION MANAGEMENT</span><h2>Bookings are not enabled.</h2><p>This workspace does not accept or confirm reservations. Add owner-approved booking hours, capacity, party limits, confirmation rules, and contact policy before enabling requests.</p><span className="admin-demo-pill">DISABLED · NO CUSTOMER REQUESTS STORED</span></div></section>}

      {loading && <div className="admin-loading" role="status">Loading saved cafe data…</div>}
      <footer className="admin-footer">SUGAR_RUSH cafe admin · Local development build · Menu prices use integer paise in storage</footer>
    </main>
  </div>;
}
