import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { uid } from "./store.js";
import { ghs, plural, readyLabel, timeAgo } from "./data.js";

/* ---- identity: who is using this browser (kept in localStorage so "Your listings" survive a reload) ---- */
const ME_KEY = "harvestboard:me";
export function useMe(fixed) {
  const [me, setMe] = useState(() => {
    if (fixed) return fixed;
    try {
      const r = JSON.parse(localStorage.getItem(ME_KEY));
      if (r && r.id) return r;
    } catch {}
    return { id: uid(), name: "", phone: "" };
  });
  useEffect(() => {
    if (!fixed) try { localStorage.setItem(ME_KEY, JSON.stringify(me)); } catch {}
  }, [me, fixed]);
  const update = useCallback((patch) => setMe((m) => ({ ...m, ...patch })), []);
  return [me, update];
}

/* ---- re-render now and then so "5m ago" stays true ---- */
export function useTick(ms = 20000) {
  const [, set] = useState(0);
  useEffect(() => {
    const t = setInterval(() => set((n) => n + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}

/* ---- toasts ---- */
const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);
export function Pane({ children, className = "" }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((text) => {
    const id = uid();
    setToasts((t) => [...t.slice(-2), { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      <div className={"pane " + className}>
        {children}
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => <div className="toast" key={t.id}>{t.text}</div>)}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

/* calls onNew(fresh items) when items appear after the first load */
export function useNewItems(items, ready, onNew) {
  const seen = useRef(null);
  useEffect(() => {
    if (!ready) return;
    if (seen.current) {
      const fresh = items.filter((i) => !seen.current.has(i.id));
      if (fresh.length) onNew(fresh);
    }
    seen.current = new Set(items.map((i) => i.id));
  }, [items, ready]); // eslint-disable-line react-hooks/exhaustive-deps
}

/* ---- listing card ---- */
const EMOJI = { Tomatoes: "🍅", "Hot pepper": "🌶️", "Garden eggs": "🍆", Okro: "🌿", Cabbage: "🥬", Onions: "🧅", Carrots: "🥕", Plantain: "🍌", Cassava: "🌱", Maize: "🌽", Eggs: "🥚" };
export function ListingCard({ l, mine, count, children }) {
  const fresh = !l.sample && Date.now() - l.createdAt < 8000;
  const date = new Date(l.readyDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return (
    <article className={"lcard" + (fresh ? " fresh" : "") + (l.status === "sold" ? " sold" : "")}>
      <header className="lhead">
        <span className="emoji" aria-hidden="true">{EMOJI[l.crop] || "🧺"}</span>
        <div>
          <h3>{l.crop}</h3>
          <p className="qty">{l.qty} {plural(l.qty, l.unit)}</p>
        </div>
        <div className="badges">
          {l.sample && <span className="badge">Sample</span>}
          {mine && <span className="badge mine">Yours</span>}
          {l.status === "sold" && <span className="badge sold">Sold</span>}
        </div>
      </header>
      <div className="when"><strong>{readyLabel(l.readyDate)}</strong><span>{date}</span></div>
      <ul className="meta">
        <li>📍 {l.area}</li>
        <li>👤 {l.farmerName}</li>
        <li>💰 {l.price != null && l.price !== "" ? `${ghs(l.price)} per ${l.unit}` : "Ask the farmer for a price"}</li>
        <li>🕒 Posted {timeAgo(l.createdAt)}</li>
      </ul>
      {l.note ? <p className="note">{l.note}</p> : null}
      {count > 0 && <p className="interest">{count} buyer{count > 1 ? "s" : ""} interested</p>}
      {children}
    </article>
  );
}
