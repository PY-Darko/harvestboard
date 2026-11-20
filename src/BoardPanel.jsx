import { useMemo, useState } from "react";
import { addRequest } from "./store.js";
import { CROPS, plural, telLink, validPhone, waLink } from "./data.js";
import { ListingCard, useNewItems, useTick, useToast } from "./ui.jsx";

export default function BoardPanel({ snap, me, setMe }) {
  useTick();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [crop, setCrop] = useState("");
  const [sort, setSort] = useState("soon");
  const [showSold, setShowSold] = useState(false);
  const [openId, setOpenId] = useState(null);

  // announce new listings from other people as they arrive
  useNewItems(snap.listings, snap.ready, (fresh) =>
    fresh.filter((l) => !l.sample && l.farmerId !== me.id).forEach((l) =>
      toast(`New on the board: ${l.qty} ${plural(l.qty, l.unit)} of ${l.crop} · ${l.area}`)
    )
  );

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return snap.listings
      .filter((l) => (showSold || l.status !== "sold") && (!crop || l.crop === crop))
      .filter((l) => !term || [l.crop, l.area, l.farmerName].join(" ").toLowerCase().includes(term))
      .sort((a, b) => (sort === "new" ? b.createdAt - a.createdAt : a.readyDate.localeCompare(b.readyDate) || b.createdAt - a.createdAt));
  }, [snap.listings, q, crop, sort, showSold]);

  const open = snap.listings.filter((l) => l.status !== "sold");
  const farmers = new Set(open.map((l) => l.farmerId)).size;
  const filtered = q || crop;

  return (
    <section className="col" aria-label="Buyer board">
      <div>
        <div className="boardhead">
          <div>
            <h2 className="h2">Available soon</h2>
            <div className="stats">
              <span className="chip">{open.length} listing{open.length === 1 ? "" : "s"}</span>
              <span className="chip">{farmers} farmer{farmers === 1 ? "" : "s"}</span>
              <span className="chip">{snap.requests.length} buyer request{snap.requests.length === 1 ? "" : "s"}</span>
            </div>
          </div>
        </div>

        <div className="filters">
          <input className="input search" type="search" placeholder="Search crop, location or farmer" aria-label="Search listings" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input" aria-label="Filter by crop" value={crop} onChange={(e) => setCrop(e.target.value)}>
            <option value="">All crops</option>
            {CROPS.filter((c) => c !== "Other").map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="soon">Harvest soonest</option>
            <option value="new">Newest first</option>
          </select>
          <label className="check"><input type="checkbox" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} /> Show sold</label>
        </div>

        {!snap.ready ? (
          <div className="empty">Loading the board…</div>
        ) : rows.length === 0 ? (
          <div className="empty">
            <p>{filtered ? "No listings match your search." : "Nothing is listed yet. Farmers can post the first listing."}</p>
            {filtered && <button className="btn ghost small" onClick={() => { setQ(""); setCrop(""); }}>Clear filters</button>}
          </div>
        ) : (
          <div className="listings">
            {rows.map((l) => (
              <BuyCard key={l.id} l={l} snap={snap} me={me} setMe={setMe} open={openId === l.id} setOpen={(v) => setOpenId(v ? l.id : null)} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function BuyCard({ l, snap, me, setMe, open, setOpen }) {
  const toast = useToast();
  const mine = l.farmerId === me.id;
  const reqs = snap.requests.filter((r) => r.listingId === l.id);
  const sent = reqs.some((r) => r.buyerId === me.id);
  const [name, setName] = useState(me.name);
  const [phone, setPhone] = useState(me.phone);
  const [msg, setMsg] = useState(`Hello, I'd like to buy your ${l.crop.toLowerCase()}. Is it still available?`);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const sold = l.status === "sold";

  async function send(e) {
    e.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!validPhone(phone)) return setErr("Enter a phone number the farmer can call.");
    setBusy(true);
    setErr("");
    try {
      await addRequest({ listingId: l.id, buyerId: me.id, buyerName: name.trim(), buyerPhone: phone.trim(), message: msg.trim() });
      setMe({ name: name.trim(), phone: phone.trim() });
      setOpen(false);
      toast("Request sent. The farmer sees it right away.");
    } catch {
      setErr("Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ListingCard l={l} mine={mine} count={reqs.length}>
      {open && !sent && !sold && (
        <form className="inline-form" onSubmit={send} noValidate>
          <input className="input" placeholder="Your name" aria-label="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" type="tel" placeholder="Your phone" aria-label="Your phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input" aria-label="Message" value={msg} onChange={(e) => setMsg(e.target.value)} />
          {err && <span className="err" role="alert">{err}</span>}
          <div className="mini">
            <button className="btn small" disabled={busy}>{busy ? "Sending…" : "Send request"}</button>
            <button type="button" className="btn small ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
      {!mine && (
        <div className="actions">
          {sold ? (
            <button className="btn small ghost" disabled>Sold</button>
          ) : sent ? (
            <button className="btn small ghost" disabled>Request sent ✓</button>
          ) : (
            !open && <button className="btn small" onClick={() => setOpen(true)}>I'm interested</button>
          )}
          {!sold && !l.sample && (
            <>
              <a className="btn small ghost" href={telLink(l.farmerPhone)}>Call {l.farmerPhone}</a>
              <a className="btn small ghost" href={waLink(l.farmerPhone, `Hello ${l.farmerName}, I saw your ${l.crop} on Harvest Board.`)} target="_blank" rel="noreferrer">WhatsApp</a>
            </>
          )}
        </div>
      )}
    </ListingCard>
  );
}
