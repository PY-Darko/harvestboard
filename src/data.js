export const CROPS = ["Tomatoes", "Hot pepper", "Garden eggs", "Okro", "Cabbage", "Onions", "Carrots", "Plantain", "Cassava", "Maize", "Eggs", "Other"];
export const UNITS = ["crate", "bag", "sack", "basket", "tray", "kg", "bunch"];
export const AREAS = ["Dawhenya", "Dodowa", "Amasaman", "Pokuase", "Aburi", "Kasoa", "Tema", "Ada", "Prampram", "Other"];

export const ghs = (n) => "GH₵ " + Number(n).toLocaleString("en-GH", { maximumFractionDigits: 2 });

export function localISO(d = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function plural(qty, unit) {
  if (unit === "kg") return "kg";
  if (Number(qty) === 1) return unit;
  return unit === "bunch" ? "bunches" : unit + "s";
}

export function readyLabel(iso) {
  const days = Math.round((new Date(iso + "T00:00:00") - new Date(localISO() + "T00:00:00")) / 864e5);
  if (days <= 0) return "Ready now";
  if (days === 1) return "Ready tomorrow";
  return `Ready in ${days} days`;
}

export function timeAgo(ts) {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export const telLink = (phone) => "tel:" + String(phone).replace(/[^\d+]/g, "");

export function waLink(phone, text) {
  let d = String(phone).replace(/\D/g, "");
  if (d.startsWith("0")) d = "233" + d.slice(1);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

export const validPhone = (p) => {
  const d = String(p).replace(/\D/g, "");
  return d.length >= 9 && d.length <= 13;
};

// Sample listings so the board is never empty on first load. They are labelled "Sample" in the UI.
export function seedListings() {
  const day = (n) => localISO(new Date(Date.now() + n * 864e5));
  const ago = (h) => Date.now() - h * 36e5;
  const base = { status: "available", sample: true, farmerPhone: "024 000 0000" };
  return [
    { ...base, id: "s1", crop: "Tomatoes", qty: 40, unit: "crate", price: 450, area: "Dawhenya", readyDate: day(2), note: "Firm, red, picked in the morning.", farmerId: "s-f1", farmerName: "Sample farmer A", createdAt: ago(5) },
    { ...base, id: "s2", crop: "Hot pepper", qty: 15, unit: "bag", price: 600, area: "Dodowa", readyDate: day(0), note: "", farmerId: "s-f2", farmerName: "Sample farmer B", createdAt: ago(9) },
    { ...base, id: "s3", crop: "Garden eggs", qty: 25, unit: "bag", price: 180, area: "Amasaman", readyDate: day(4), note: "", farmerId: "s-f3", farmerName: "Sample farmer C", createdAt: ago(20) },
    { ...base, id: "s4", crop: "Cabbage", qty: 60, unit: "sack", price: 220, area: "Aburi", readyDate: day(7), note: "Large heads.", farmerId: "s-f4", farmerName: "Sample farmer D", createdAt: ago(30) },
  ];
}
