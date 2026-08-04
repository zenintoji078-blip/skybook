/* =========================================================
   SKYBOOK — shared application logic
   Demo-only: uses localStorage to pass state between pages.
   ========================================================= */

const SKYBOOK_KEY = "skybook_state_v1";

const AIRPORTS = {
  DEL: "New Delhi", BOM: "Mumbai", BLR: "Bengaluru", MAA: "Chennai",
  CCU: "Kolkata", HYD: "Hyderabad", GOI: "Goa", DXB: "Dubai",
  SIN: "Singapore", LHR: "London", JFK: "New York", NRT: "Tokyo",
  BKK: "Bangkok", CDG: "Paris", SYD: "Sydney"
};

const AIRLINES = [
  { name: "Horizon Air",   code: "HZ" },
  { name: "Aurora Wings",  code: "AW" },
  { name: "Meridian Jet",  code: "MJ" },
  { name: "Northstar Air", code: "NS" },
  { name: "Coral Skies",   code: "CS" }
];

function getState() {
  try { return JSON.parse(localStorage.getItem(SKYBOOK_KEY)) || {}; }
  catch (e) { return {}; }
}

function setState(patch) {
  const current = getState();
  const next = Object.assign({}, current, patch);
  localStorage.setItem(SKYBOOK_KEY, JSON.stringify(next));
  return next;
}

function fmtMoney(n) {
  return "\u20b9" + n.toLocaleString("en-IN");
}

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/* Deterministic-ish demo flight generator so the same search
   returns a stable-feeling list. */
function generateFlights(from, to, date) {
  const seedBase = (from + to + date).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 6;
  const flights = [];
  for (let i = 0; i < count; i++) {
    const seed = seedBase + i * 17;
    const airline = AIRLINES[Math.floor(seededRandom(seed) * AIRLINES.length)];
    const depHour = 5 + Math.floor(seededRandom(seed + 1) * 17);
    const depMin = Math.floor(seededRandom(seed + 2) * 4) * 15;
    const durationMin = 75 + Math.floor(seededRandom(seed + 3) * 300);
    const stops = seededRandom(seed + 4) < 0.6 ? 0 : (seededRandom(seed + 4) < 0.85 ? 1 : 2);
    const price = Math.round(((89 + Math.floor(seededRandom(seed + 5) * 620)) * 83) / 100) * 100;

    const depDate = new Date(`${date}T00:00:00`);
    depDate.setMinutes(depDate.getMinutes() + depHour * 60 + depMin);
    const arrDate = new Date(depDate.getTime() + durationMin * 60000);

    flights.push({
      id: `SKY-${seedBase}-${i}`,
      airline: airline.name,
      flightNo: `${airline.code}${100 + Math.floor(seededRandom(seed + 6) * 800)}`,
      from, to,
      depTime: depDate.toISOString(),
      arrTime: arrDate.toISOString(),
      durationMin,
      stops,
      price
    });
  }
  return flights.sort((a, b) => a.price - b.price);
}

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDuration(min) {
  const h = Math.floor(min / 60), m = min % 60;
  return `${h}h ${m}m`;
}

function fmtDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function pnr() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* -------- Auth (demo only, no backend) -------- */
function fakeSignIn(email) {
  setState({ user: { email, name: email.split("@")[0] } });
}

function isSignedIn() {
  return !!getState().user;
}

function signOut() {
  const s = getState();
  delete s.user;
  localStorage.setItem(SKYBOOK_KEY, JSON.stringify(s));
}

/* Update nav auth link across pages */
function refreshAuthNav() {
  const el = document.querySelector("[data-auth-slot]");
  if (!el) return;
  const state = getState();
  if (state.user) {
    el.textContent = `Sign out (${state.user.name})`;
    el.setAttribute("href", "#");
    el.onclick = (e) => { e.preventDefault(); signOut(); window.location.href = "index.html"; };
  } else {
    el.textContent = "Sign in";
    el.setAttribute("href", "login.html");
  }
}

document.addEventListener("DOMContentLoaded", refreshAuthNav);
