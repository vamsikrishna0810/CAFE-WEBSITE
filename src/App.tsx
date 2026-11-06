import { type ReactNode, useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router";

const asset = (name: string) => `/assets/${name}`;

const menuItems = [
  { category: "Bakes & cake", name: "Strawberry shortcake", detail: "Soft sponge, berries & a cloud of cream" },
  { category: "Bakes & cake", name: "Chocolate cherry slice", detail: "Rich chocolate, bright cherry, little fork" },
  { category: "Bakes & cake", name: "Cinnamon sugar knots", detail: "Warm pull-apart bites with cinnamon sugar" },
  { category: "Coffee & sips", name: "Vanilla latte", detail: "Espresso, silky milk & a hint of vanilla" },
  { category: "Coffee & sips", name: "Iced strawberry matcha", detail: "Cool matcha with a strawberry swirl" },
  { category: "Little bites", name: "Tomato & cheese toastie", detail: "Crisp-edged, melty and made for lunch" },
];

const gallery = [
  { image: "sugar-rush-cafe.jpg", alt: "Warm cafe interior with booths and pastry counter", caption: "Find your sunny corner" },
  { image: "sugar-rush-cake.jpg", alt: "Cherry chocolate layer cake on a cream plate", caption: "Something sweet" },
  { image: "sugar-rush-coffee.jpg", alt: "Coffee cups served by the cafe window", caption: "One more coffee" },
  { image: "sugar-rush-courtyard.jpg", alt: "Cafe courtyard with leafy plants and bistro tables", caption: "A little fresh air" },
  { image: "sugar-rush-hero.jpg", alt: "Strawberry cake and coffee on a cafe table", caption: "Make a day of it" },
];

const navigation = [
  ["/about", "ABOUT"],
  ["/cafe", "CAFE"],
  ["/menu", "MENU"],
  ["/shop", "SHOP"],
  ["/events", "EVENTS"],
  ["/visit", "VISIT"],
] as const;

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <>
      <div className="announce">Cafe <span>•</span> Bakery <span>•</span> Sweet little things</div>
      <header className="topbar">
        <Link className="brand" to="/" aria-label="SUGAR_RUSH home">
          <img src={asset("SUGAR_RUSH_logo.svg")} alt="" />
          <span>SUGAR_RUSH</span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span>{menuOpen ? "CLOSE" : "MENU"}</span>
          <span className="menu-lines" aria-hidden="true"><i /><i /></span>
        </button>
        <nav id="site-navigation" className={`nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          {navigation.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "active" : "")}>
              {label}
            </NavLink>
          ))}
          <NavLink className="nav-cta" to="/menu">VIEW MENU</NavLink>
        </nav>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div><Link to="/" className="footer-brand">SUGAR_RUSH</Link><p>A little joy, by the slice.</p></div>
      <div><h4>Explore</h4><Link to="/about">About</Link><Link to="/cafe">Cafe</Link><Link to="/menu">Menu</Link></div>
      <div><h4>More to love</h4><Link to="/shop">Shop</Link><Link to="/events">Events</Link></div>
      <div><h4>Come say hello</h4><Link to="/visit">Visit us</Link><span className="placeholder">Contact details to come</span></div>
    </footer>
  );
}

function Layout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return <div className="site-shell"><Header /><main><Outlet /></main><Footer /></div>;
}

function Hero({
  kicker,
  title,
  description,
  image = "sugar-rush-hero.jpg",
  alt,
  actions,
}: {
  kicker: string;
  title: ReactNode;
  description: string;
  image?: string;
  alt: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="hero">
      <img className="hero-img" src={asset(image)} alt={alt} />
      <div className="hero-copy">
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{description}</p>
        {actions && <div className="hero-links">{actions}</div>}
      </div>
      <div className="hero-note">A little joy, by the slice</div>
    </section>
  );
}

function PageHero({
  kicker,
  title,
  description,
  image,
  alt,
}: {
  kicker: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}) {
  return (
    <section className="page-hero">
      <img src={asset(image)} alt={alt} />
      <div className="page-hero-copy">
        <div className="eyebrow">{kicker}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}

function Ticker() {
  return <div className="ticker" aria-label="Good coffee, fresh bakes, sweet moments"><span>GOOD COFFEE · FRESHLY BAKED · SWEET LITTLE MOMENTS · GOOD COFFEE · FRESHLY BAKED · SWEET LITTLE MOMENTS · </span></div>;
}

function HomePage() {
  return (
    <>
      <Hero
        kicker="Cafe · bakery · sweet little things"
        title={<>Welcome to<br />SUGAR_RUSH.</>}
        description="A little neighborhood joy, served with coffee, cake and room for one more."
        actions={<><Link className="button fill" to="/menu">View the menu</Link><Link className="button" to="/visit">Plan a visit</Link></>}
        alt="Sunlit cafe table with strawberry cake, coffee and flowers"
      />
      <Ticker />
      <section className="intro">
        <div className="eyebrow">Welcome</div>
        <h2>A happy little hideaway<br />for everyday celebrations.</h2>
        <p>SUGAR_RUSH is a cafe concept for the first coffee, the birthday slice, and the catch-up that turns into the whole afternoon. Pull up a chair, find a favorite, and make a little day of it.</p>
        <span className="demo">Brand story · customize before launch</span>
      </section>

      <section className="section" id="cafe">
        <div className="section-head"><div><div className="eyebrow">Cafe</div><h2>Take a little look around.</h2></div><p>A sunny seat, a sweet treat, and a moment to stay awhile.<br /><span className="demo">AI concept photography</span></p></div>
        <div className="gallery">{gallery.map((item) => <figure className="gallery-card" key={item.image}><img src={asset(item.image)} alt={item.alt} loading="lazy" /><figcaption>{item.caption}</figcaption></figure>)}</div>
        <Link className="text-link" to="/cafe">More about the cafe →</Link>
      </section>

      <section className="feature-band">
        <img className="feature-photo" src={asset("sugar-rush-courtyard.jpg")} alt="Sunlit cafe courtyard with plants and tables" loading="lazy" />
        <div className="feature-copy"><div className="eyebrow">Shop SUGAR_RUSH</div><h2>Take a little<br />sweetness home.</h2><p>From cafe favorites to little gifts, this is where the SUGAR_RUSH shop will live. Shop details and products can be added when they're ready.</p><span className="demo">Online shop · coming soon</span><Link className="text-link" to="/shop">Take a peek →</Link></div>
      </section>

      <section className="section">
        <div className="section-head"><div><div className="eyebrow">SUGAR_RUSH is...</div><h2>A little bit of everything lovely.</h2></div><p>All the pieces that make a cafe day feel special.</p></div>
        <div className="four-grid">
          <FeatureTile image="sugar-rush-cake.jpg" alt="Chocolate cherry cake" title="Bakery" text="Little treats and celebratory slices." />
          <FeatureTile image="sugar-rush-coffee.jpg" alt="Two coffees on a cafe table" title="Coffee" text="A cozy cup for the slow moments." />
          <FeatureTile image="sugar-rush-hero.jpg" alt="Cake and coffee for sharing" title="Cafe" text="A place to settle in and catch up." />
          <FeatureTile image="sugar-rush-courtyard.jpg" alt="A little cafe courtyard" title="Gatherings" text="Good company makes every treat sweeter." />
        </div>
        <p className="section-note"><span className="demo">Illustrative concept sections</span></p>
      </section>

      <section className="events" id="events">
        <img className="event-img" src={asset("sugar-rush-coffee.jpg")} alt="Coffee and a warm cafe moment" loading="lazy" />
        <div className="event-copy"><div className="eyebrow">Events</div><h2>A little something<br />on the calendar.</h2><p>Pop-ups, celebrations, and sweet reasons to get together. SUGAR_RUSH event dates and details can be added here.</p><span className="demo">Event calendar · coming soon</span><br /><Link className="text-link light-link" to="/events">See event updates →</Link></div>
      </section>

      <section className="banner"><div className="eyebrow">A little extra sweetness</div><h2>Make yourself a regular.</h2><p>Memberships and rewards can make every visit feel like a treat. SUGAR_RUSH membership details will be shared here once the program is ready.</p><span className="demo">Memberships · coming soon</span></section>

      <section className="recognition"><div><div className="eyebrow">Recognition</div><h2>Good things are growing.</h2><p><span className="demo">Add verified press, awards or community memberships here</span></p></div><div className="badge-row"><span className="badge">ADD<br />AWARD</span><span className="badge">ADD<br />PRESS</span><span className="badge">ADD<br />PARTNER</span></div></section>
    </>
  );
}

function FeatureTile({ image, alt, title, text }: { image: string; alt: string; title: string; text: string }) {
  return <article className="tile"><img src={asset(image)} alt={alt} loading="lazy" /><h3>{title}</h3><p>{text}</p></article>;
}

function AboutPage() {
  return <>
    <PageHero kicker="A neighborhood cafe" title="About SUGAR_RUSH" description="A little joy, by the slice. Here's the story behind the cafe and the small moments that make it feel like home." image="sugar-rush-hero.jpg" alt="Cake and coffee in a sunlit cafe" />
    <section className="intro"><div className="eyebrow">Our story</div><h2>Life's too short<br />to skip the good bit.</h2><p>SUGAR_RUSH is a cheerful cafe concept built around a simple idea: make ordinary days a little sweeter. Pull up a chair for cake, coffee, and good company.</p><span className="demo">Draft story · replace with owner-approved details</span></section>
    <section className="banner"><div className="eyebrow">Events & specials</div><h2>Little reasons to come back.</h2><p>Seasonal specials, cafe happenings and community updates will be shared here once confirmed.</p><span className="demo">Details to come</span></section>
  </>;
}

function CafePage() {
  return <>
    <PageHero kicker="Cafe" title="The Cafe" description="A bright, easygoing place to pause for a coffee, share something sweet, and stay a little longer." image="sugar-rush-cafe.jpg" alt="Warm cafe interior with tables and a pastry counter" />
    <section className="intro"><div className="eyebrow">Find your corner</div><h2>Settle in. Stay awhile.</h2><p>Inside, outside, by the window or near the cake case. Find the seat that feels like yours.</p><span className="demo">AI concept images · replace with cafe photos before launch</span></section>
    <section className="section"><div className="cards">{gallery.slice(0, 3).map((item) => <figure className="image-card" key={item.image}><img src={asset(item.image)} alt={item.alt} loading="lazy" /><figcaption>{item.caption}</figcaption></figure>)}</div></section>
  </>;
}

function MenuPage() {
  const [category, setCategory] = useState("Everything");
  const [query, setQuery] = useState("");
  const categories = ["Everything", "Bakes & cake", "Coffee & sips", "Little bites"];
  const shown = menuItems.filter((item) => (category === "Everything" || item.category === category) && `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase().trim()));

  return <>
    <PageHero kicker="Good things, made to be savored" title="The Menu" description="A little something for every mood. Browse the sample menu; final dishes, dietary notes, and prices are still to be confirmed." image="sugar-rush-cake.jpg" alt="Cherry chocolate cake" />
    <section className="section menu-section">
      <div className="section-head"><div><div className="eyebrow">Find your favorite</div><h2>Something for every mood.</h2></div><span className="demo">Sample menu · demo</span></div>
      <label className="search-field"><span>Search the menu</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try cake or latte" /></label>
      <div className="filter-list" role="group" aria-label="Filter menu by category">{categories.map((item) => <button key={item} type="button" className={`filter-button ${category === item ? "selected" : ""}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="menu-list">{shown.length ? shown.map((item) => <article className="menu-row" key={item.name}><div><b>{item.name}</b><small>{item.detail}</small></div><strong>Price to come</strong></article>) : <p className="empty-menu">No treats match that search. Try another name.</p>}</div>
    </section>
  </>;
}

function ShopPage() {
  return <>
    <PageHero kicker="A little sweetness to take home" title="The Shop" description="The SUGAR_RUSH shop is getting ready. Product details and online ordering will appear here when they're available." image="sugar-rush-courtyard.jpg" alt="Sunlit cafe courtyard" />
    <section className="section"><div className="section-head"><div><div className="eyebrow">Coming soon</div><h2>Take your favorites home.</h2></div><p>Shop details are a preview until products and ordering are confirmed.</p></div><div className="cards">{gallery.slice(1, 4).map((item) => <figure className="image-card" key={item.image}><img src={asset(item.image)} alt={item.alt} loading="lazy" /><figcaption>{item.caption}</figcaption></figure>)}</div><p className="section-note"><span className="demo">Online shop not connected</span></p></section>
  </>;
}

function EventsPage() {
  return <>
    <PageHero kicker="Make it a moment" title="Events & Specials" description="Little gatherings, seasonal treats and good reasons to meet up. Check back for SUGAR_RUSH event updates." image="sugar-rush-coffee.jpg" alt="Coffee in a cozy cafe" />
    <section className="intro"><div className="eyebrow">Coming up</div><h2>We'll save you a seat.</h2><p>There aren't any confirmed events to list yet. Once the calendar is ready, dates and details will live here.</p><span className="demo">No events published</span></section>
  </>;
}

function VisitPage() {
  return <>
    <PageHero kicker="We'd love to see you" title="Visit SUGAR_RUSH" description="Planning a coffee run or a slice of cake? Add the verified location and hours here before opening the page to customers." image="sugar-rush-courtyard.jpg" alt="Sunny cafe courtyard" />
    <section className="visit"><div><div className="eyebrow">Come on over</div><h2>Find our door.</h2><p>Visit information will be added when the cafe details are confirmed.</p></div><div><h3>Location & contact</h3><p><span className="placeholder">Add verified cafe address</span></p><p><span className="placeholder">Add phone / contact details</span></p></div><div><h3>When we're open</h3><p><span className="placeholder">Add verified opening hours</span></p><p>Table requests are unavailable in this preview.</p></div></section>
  </>;
}

function App() {
  return <Routes><Route element={<Layout />}>
    <Route index element={<HomePage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="cafe" element={<CafePage />} />
    <Route path="menu" element={<MenuPage />} />
    <Route path="shop" element={<ShopPage />} />
    <Route path="events" element={<EventsPage />} />
    <Route path="visit" element={<VisitPage />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Route></Routes>;
}

export default App;
