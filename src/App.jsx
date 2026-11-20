import { useEffect, useState, useSyncExternalStore } from "react";
import { getSnapshot, resetDemo, subscribe } from "./store.js";
import { Pane, useMe } from "./ui.jsx";
import FarmerPanel from "./FarmerPanel.jsx";
import BoardPanel from "./BoardPanel.jsx";

const KOFI = { id: "demo-farmer", name: "Kofi Mensah", phone: "024 000 0111" };
const AMA = { id: "demo-buyer", name: "Ama Owusu", phone: "024 000 0222" };

export default function App() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  const [demo, setDemo] = useState(() => new URLSearchParams(window.location.search).has("demo"));
  const [me, setMe] = useMe();
  const [kofi, setKofi] = useMe(KOFI);
  const [ama, setAma] = useMe(AMA);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    try {
      const u = new URL(window.location.href);
      demo ? u.searchParams.set("demo", "1") : u.searchParams.delete("demo");
      window.history.replaceState(null, "", u);
    } catch {}
  }, [demo]);

  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div>
            <h1>Harvest Board</h1>
            <p className="tag">Farmers list what's coming. Buyers find it before harvest.</p>
          </div>
          <div className="hero-actions">
            <span className="live" title="Updates instantly in every tab of this browser">
              <span className="dot" aria-hidden="true" /> Live · this browser
            </span>
            <button className="btn ghost small" onClick={() => setDemo((d) => !d)}>{demo ? "Back to normal view" : "Split-screen demo"}</button>
          </div>
        </div>
      </header>

      <main className="wrap">
        {snap.error && <div className="banner" role="alert" style={{ marginBottom: 16 }}>{snap.error}</div>}
        {demo ? (
          <div className="devices">
            <Pane className="devicepane">
              <div className="device">
                <div className="device-bar">Farmer · Kofi's phone</div>
                <div className="device-body"><FarmerPanel snap={snap} me={kofi} setMe={setKofi} /></div>
              </div>
            </Pane>
            <Pane className="devicepane">
              <div className="device">
                <div className="device-bar">Buyer · Ama's screen</div>
                <div className="device-body"><BoardPanel snap={snap} me={ama} setMe={setAma} /></div>
              </div>
            </Pane>
          </div>
        ) : (
          <Pane>
            <div className="grid">
              <FarmerPanel snap={snap} me={me} setMe={setMe} />
              <BoardPanel snap={snap} me={me} setMe={setMe} />
            </div>
          </Pane>
        )}
        <footer>
          <span>Listings marked “Sample” are example data. Prices and quantities are set by farmers.</span>
          {confirmReset ? (
            <button onClick={() => { resetDemo(); setConfirmReset(false); }}>Click again to reset all data</button>
          ) : (
            <button onClick={() => setConfirmReset(true)}>Reset demo data</button>
          )}
        </footer>
      </main>
    </>
  );
}
