# Harvest Board

**Farmers list what's coming. Buyers find it before harvest.**

Codetrain 6-Week Innovation Challenge · Mini Demo Day

## Problem and solution (one sentence each)

**Problem:** Small-scale vegetable farmers around Accra struggle to find reliable buyers at harvest because they depend on word of mouth and middlemen, resulting in unsold produce, low prices and lost income.

**Solution:** Harvest Board is a web app where farmers post what is coming and when, and buyers see it instantly and contact the farmer directly.

## Run it

```bash
npm install
npm run dev        # open the address it prints
```

Build for hosting: `npm run build` (output in `dist/`). Upload `dist/` to Vercel or Netlify, or connect the repo to either.

Two ways to see it live:
- **Split-screen demo:** click "Split-screen demo" (or open `/?demo=1`). A farmer's phone and a buyer's screen sit side by side. This is the best view for presenting.
- **Two windows:** open the app in two tabs of the same browser. Both update instantly. Both tabs share one identity, so for the two-tab view use a private window for the buyer.

## How it works

```
React (Vite)  ->  src/store.js  ->  localStorage (saves)  +  BroadcastChannel (tells other tabs)
```

- `src/FarmerPanel.jsx`: post a listing, manage your listings, see interested buyers.
- `src/BoardPanel.jsx`: the live board with search, crop filter, sorting and "I'm interested".
- `src/store.js`: one small data API (`addListing`, `setStatus`, `removeListing`, `addRequest`). The screens only use these functions, so a shared database could replace this one file later without touching the screens.
- `src/data.js`: crops, units, helpers (dates, phone links, formatting).

### Data
- **Listing:** crop, quantity, unit, expected harvest date, location, optional price, farmer name and phone, status (available or sold).
- **Request:** a buyer's name, phone and message for one listing.

## What we deliberately did NOT build (Getting Real)
- Payments. Buyers and farmers agree price and payment by phone, as they do today.
- Delivery and transport booking.
- Ratings, chat and a full account system.
- A shared online database (see below).
- AI features. The first version solves the problem with normal software.

## Known limitations (be honest on Demo Day)
- **Data lives in one browser.** Listings are saved in the browser, and the board updates live across tabs and windows of that browser. Two different phones do not yet see the same board.
- **Sign-in is simulated.** There are no passwords. A person is identified by a random id saved in their browser, so "Your listings" only appear on the device that posted them.
- **Sample listings** are labelled "Sample" and are not real farmers.
- Buyers and farmers are not verified.

## What I would do next
1. Add a shared online database so farmers and buyers on different phones see one board.
2. Add phone-number sign-in so each farmer can edit only their own listings.
3. Verify farmers and buyers to reduce fake listings.

## Future AI opportunities
- **Price guidance:** suggest a fair asking price from past listings and seasons, once there is enough sales history.
- **Buyer matching:** alert buyers who often ask for a crop when a matching listing appears.
- **Supply forecasting:** predict which crops will be oversupplied in a week so farmers can plan.
- **Voice and local-language listing:** let a farmer describe a harvest in Twi or English by voice and fill the form from it.

## Demo script (about 4 minutes)

Open `/?demo=1` before you start. Click "Reset demo data" first so the board is clean.

1. **Problem (30 s).** One sentence, then your best number or quote from the farmers you interviewed.
2. **Meet Kofi and Ama (20 s).** "Kofi farms tomatoes near Dodowa. Ama buys for a market stall in Accra. Kofi's phone is on the left, Ama's screen is on the right."
3. **Kofi posts (45 s).** Choose Tomatoes, quantity, harvest date in 3 days, location, price, and press **Post listing**.
4. **It appears live (20 s).** Point to Ama's screen: the card pops in and a notification shows. Say: "No refresh. She sees it as he posts."
5. **Ama responds (45 s).** Press **I'm interested**, send the request.
6. **Kofi is told (30 s).** His notification appears and the request shows under his listing with Call and WhatsApp buttons. "From listing to conversation in under a minute."
7. **Close the loop (20 s).** Kofi presses **Mark as sold**; the card leaves Ama's board.
8. **Wrap-up (60 s).** What you tested, what is still missing (say it plainly), what you chose not to build, future AI.

**Backup plan:** record this walkthrough on your phone beforehand and keep screenshots in your slides. If Wi-Fi or the laptop fails, play the recording. The app works offline.

## Likely questions from assessors
- *Why this data design?* Two kinds of record: listings and requests. A request points to one listing. That is all the core journey needs.
- *What happens when a request fails?* The form shows an error and keeps what the user typed. Nothing is lost.
- *How is it real-time?* When one tab saves a change, the browser's BroadcastChannel tells the other tabs to reload from storage.
- *Why no shared database yet?* The core question for Week 6 was whether the listing-to-buyer flow works. Storing data in the browser let me test that flow quickly. A shared database is the first next step, and the screens already talk to one store file so it can be swapped in.
- *What stops someone posting fake listings?* Nothing yet. That is the first thing to fix, with phone verification.
- *Why not payments?* The core problem is finding a buyer. Payments can wait until the core flow is proven.
