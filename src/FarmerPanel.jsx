import { useState } from "react";
import { addListing, removeListing, setStatus } from "./store.js";
import { AREAS, CROPS, UNITS, localISO, telLink, timeAgo, validPhone, waLink } from "./data.js";
import { ListingCard, useNewItems, useTick, useToast } from "./ui.jsx";

const blank = { crop: "", other: "", qty: "", unit: "kg", date: "", price: "" };

export default function FarmerPanel({ snap, me, setMe }) {
  useTick();
  const toast = useToast();
  const [f, setF] = useState(blank);
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  const mine = snap.listings.filter((l) => l.farmerId === me.id);
  const myRequests = snap.requests.filter((r) => mine.some((l) => l.id === r.listingId));

  // tell the farmer the moment a buyer shows interest
  useNewItems(myRequests, snap.ready, (fresh) =>
    fresh.forEach((r) => {
      const l = mine.find((x) => x.id === r.listingId);
      toast(`${r.buyerName} is interested in your ${l ? l.crop : "produce"}`);
    })
  );

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  function validate() {
    const e = {};
    const crop = f.crop === "Other" ? f.other.trim() : f.crop;
    if (!crop) e.crop = f.crop === "Other" ? "Type the crop name." : "Choose a crop.";
    if (!(Number(f.qty) > 0)) e.qty = "Enter how much you will have.";
    if (!f.date) e.date = "Pick the expected harvest date.";
    if (!location.trim()) e.location = "Where is the farm?";
    if (name.trim().length < 2) e.name = "Enter your name.";
    if (!validPhone(phone)) e.phone = "Enter a phone number buyers can reach.";
    if (f.price !== "" && !(Number(f.price) >= 0)) e.price = "Price must be a number.";
    setErrors(e);
    return { ok: Object.keys(e).length === 0, crop };
  }

  async function submit(ev) {
    ev.preventDefault();
    const { ok, crop } = validate();
    if (!ok) return;
    setBusy(true);
    setFailed("");
    try {
      await addListing({
        crop, qty: Number(f.qty), unit: f.unit, price: f.price === "" ? null : Number(f.price),
        area: location.trim(), readyDate: f.date, note: "",
        farmerId: me.id, farmerName: name.trim(), farmerPhone: phone.trim(),
      });
      setMe({ name: name.trim(), phone: phone.trim() });
      setF({ ...blank, unit: f.unit });
      toast("Posted. Buyers can see it now.");
    } catch (err) {
      setFailed("Could not post your listing. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const inv = (k) => ({ "aria-invalid": errors[k] ? "true" : undefined, "aria-describedby": errors[k] ? "e-" + k : undefined });
  const Err = ({ k }) => (errors[k] ? <span className="err" id={"e-" + k}>{errors[k]}</span> : null);

  return (
    <section className="col" aria-label="Farmer">
      <div>
        <h2 className="h2">Post a listing</h2>
        <p className="sub">Tell buyers what is coming and when.</p>
        <form className="card form" onSubmit={submit} noValidate>
          {failed && <div className="banner" role="alert">{failed}</div>}
          <div className="field">
            <label htmlFor="crop">Crop</label>
            <select id="crop" className="input" value={f.crop} onChange={set("crop")} {...inv("crop")}>
              <option value="">Select a crop</option>
              {CROPS.map((c) => <option key={c}>{c}</option>)}
            </select>
            {f.crop === "Other" && <input className="input" placeholder="Crop name" value={f.other} onChange={set("other")} aria-label="Other crop name" />}
            <Err k="crop" />
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="qty">Quantity</label>
              <input id="qty" className="input" type="number" inputMode="decimal" min="0" step="any" value={f.qty} onChange={set("qty")} {...inv("qty")} />
              <Err k="qty" />
            </div>
            <div className="field">
              <label htmlFor="unit">Unit</label>
              <select id="unit" className="input" value={f.unit} onChange={set("unit")}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="date">Expected harvest date</label>
            <input id="date" className="input" type="date" min={localISO()} value={f.date} onChange={set("date")} {...inv("date")} />
            <Err k="date" />
          </div>
          <div className="field">
            <label htmlFor="price">Asking price per {f.unit} (GH₵) <span className="opt">optional</span></label>
            <input id="price" className="input" type="number" inputMode="decimal" min="0" step="any" value={f.price} onChange={set("price")} {...inv("price")} />
            <Err k="price" />
          </div>
          <div className="field">
            <label htmlFor="loc">Farm location</label>
            <input id="loc" className="input" list="areas" placeholder="e.g. Dodowa" value={location} onChange={(e) => setLocation(e.target.value)} {...inv("location")} />
            <datalist id="areas">{AREAS.filter((a) => a !== "Other").map((a) => <option key={a} value={a} />)}</datalist>
            <Err k="location" />
          </div>
          <div className="row2">
            <div className="field">
              <label htmlFor="name">Your name</label>
              <input id="name" className="input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} {...inv("name")} />
              <Err k="name" />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input id="phone" className="input" type="tel" autoComplete="tel" placeholder="024 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} {...inv("phone")} />
              <Err k="phone" />
            </div>
          </div>
          <button className="btn" type="submit" disabled={busy}>{busy ? "Posting…" : "Post listing"}</button>
        </form>
      </div>

      <div>
        <h2 className="h2">Your listings</h2>
        {mine.length === 0 ? (
          <p className="sub" style={{ marginTop: 8 }}>Nothing posted from this device yet. Your listings and the buyers who respond will show up here.</p>
        ) : (
          <div className="mylist">
            {mine.map((l) => {
              const reqs = snap.requests.filter((r) => r.listingId === l.id);
              const sold = l.status === "sold";
              return (
                <ListingCard key={l.id} l={l} mine count={reqs.length}>
                  {reqs.length > 0 && (
                    <div className="reqs">
                      {reqs.map((r) => (
                        <div className="req" key={r.id}>
                          <div><span className="who">{r.buyerName}</span> · {timeAgo(r.createdAt)}</div>
                          {r.message && <div>“{r.message}”</div>}
                          <div className="mini">
                            <a className="btn small" href={telLink(r.buyerPhone)}>Call {r.buyerPhone}</a>
                            <a className="btn small ghost" href={waLink(r.buyerPhone, `Hello ${r.buyerName}, this is ${l.farmerName}. About my ${l.crop}.`)} target="_blank" rel="noreferrer">WhatsApp</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="actions">
                    <button className="btn small ghost" onClick={() => setStatus(l.id, sold ? "available" : "sold")}>{sold ? "Mark available" : "Mark as sold"}</button>
                    {confirmId === l.id ? (
                      <button className="btn small warn" onClick={() => { removeListing(l.id); setConfirmId(null); }}>Confirm remove</button>
                    ) : (
                      <button className="btn small ghost" onClick={() => setConfirmId(l.id)}>Remove</button>
                    )}
                  </div>
                </ListingCard>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
