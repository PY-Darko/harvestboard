// Data layer. Listings and buyer requests live in the browser (localStorage).
// A BroadcastChannel tells every other tab/window of this browser to reload, so the board updates live.
// The screens only call the functions exported here, so a shared database could replace this file later.
import { seedListings } from "./data.js";

const KEY = "harvestboard:v1";

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

let state = { listings: [], requests: [], ready: false, error: null };
const subs = new Set();
const emit = () => subs.forEach((f) => f());
const set = (patch) => {
  state = { ...state, ...patch };
  emit();
};
export const subscribe = (f) => (subs.add(f), () => subs.delete(f));
export const getSnapshot = () => state;

let channel = null;

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ listings: state.listings, requests: state.requests }));
  } catch {
    set({ error: "Could not save in this browser (storage is blocked or full)." });
  }
  channel?.postMessage("changed");
}

function write(patch) {
  set(patch);
  persist();
}

function pullFromStorage() {
  const s = load();
  if (s) set({ listings: s.listings || [], requests: s.requests || [], ready: true });
}

export function init() {
  const saved = load();
  if (saved) {
    set({ listings: saved.listings || [], requests: saved.requests || [], ready: true });
  } else {
    set({ listings: seedListings(), requests: [], ready: true });
    persist();
  }
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel("harvestboard");
    channel.onmessage = pullFromStorage;
  }
  window.addEventListener("storage", (e) => e.key === KEY && pullFromStorage());
}

/* ---- actions ---- */
export async function addListing(data) {
  const item = { id: uid(), status: "available", createdAt: Date.now(), ...data };
  write({ listings: [item, ...state.listings] });
}
export async function setStatus(id, status) {
  write({ listings: state.listings.map((l) => (l.id === id ? { ...l, status } : l)) });
}
export async function removeListing(id) {
  write({ listings: state.listings.filter((l) => l.id !== id), requests: state.requests.filter((r) => r.listingId !== id) });
}
export async function addRequest(data) {
  const item = { id: uid(), createdAt: Date.now(), ...data };
  write({ requests: [item, ...state.requests] });
}
export function resetDemo() {
  write({ listings: seedListings(), requests: [] });
}
