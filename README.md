# NONCHALANT JR STUDIO 👑⚽
> **Private eFootball Gaming Archive & Personal Control Centre**
> Production URL: [https://nonchalant-jr-studio.vercel.app/](https://nonchalant-jr-studio.vercel.app/)

NONCHALANT JR STUDIO is an exclusive, strictly private personal digital archive designed for **ONE USER ONLY (NONCHALANT JR)**. It allows you to record, organize, view, and analyze your entire eFootball gaming history with persistent online database storage, private cloud media recordings, and cross-device access.

---

## ✨ Studio Capabilities

1. **Personal Dashboard**
   - Live command centre showing total matches, win rate, trophies won, and video recordings.
   - Dynamic figures calculated exclusively from your actual saved records (zero fake metrics).
   - Recent match results feed, latest championship honors pedestal, and active game plan card.
   - One-click quick actions to record matches, upload gameplay clips, or log trophies.

2. **Complete Match History**
   - Full CRUD: Record new match, edit records, view detailed summaries, or delete records.
   - Automatic result determination (Win, Draw, Loss) calculated from scores.
   - Tracks opponent name/gamertag, competition, match type, formation used, coach, goalscorers, tactical notes, and attached gameplay video.
   - Instant search and filtering by opponent, competition, outcome (W/D/L), and sorting (newest, oldest, opponent A-Z).

3. **Match Recordings & Highlights Vault**
   - Private HD gameplay video upload with live progress tracking.
   - Powered by Supabase Private Cloud Media Storage (200MB limit per clip) with local IndexedDB fallback.
   - Tag system (Goals, Comeback, Defending, Skills, Best Match).
   - Cinema-style video playback with full controls and download button.

4. **Trophy Room & Cup History**
   - Hall of Fame pedestal gallery for championships (🏆 1st Place), runner-up medals (🥈 2nd Place), and bronze honors (🥉 3rd Place).
   - Records trophy title, date won, season, grand final opponent, final scoreline, and championship notes.
   - Filter by achievement tier.

5. **Game Plans & Tactical Lab**
   - Interactive pitch chalkboard with touch and mouse drag-and-drop player positioning.
   - Double-click any player token to customize player names.
   - Formation presets (`4-2-1-3`, `4-3-3`, `3-2-4-1`, `5-2-3`, `4-4-2`, and `Custom`).
   - Detailed instructions for eFootball individual offensive and defensive tactics.
   - Duplicate, edit, favorite, and delete game plans.

6. **Starting Eleven & Squad Management**
   - Starting XI lineup builder and substitute bench.
   - Track positions (GK, CB, LB, RB, DMF, CMF, AMF, LWF, CF, RWF), ratings, and card tiers (*Epic Booster*, *Big Time*, *Show Time*, *Highlight*, *Standard*).
   - Manager profile with playstyle boost configurations.
   - Dedicated set-piece specialists and captaincy assignments.

7. **Statistics & Performance Telemetry**
   - Authoritative KPIs: Matches played, W/D/L record, Win %, goals scored, goals conceded, goal difference, clean sheets, and 5-match recent form streak.
   - High-DPI Canvas 2D charts:
     - **Cumulative Points Trajectory Curve**: Line graph with glowing gold gradient fill.
     - **Results Ratio Doughnut**: Donut chart with centered win percentage.
     - **Match Goals Bar Chart**: Scored vs Conceded comparison per match.
   - Head-to-head records table against each opponent faced.

8. **Deep Personal Match Archive**
   - Chronological vertical timeline linking matches, tactics, video recordings, and trophies into a continuous personal legacy.

9. **Backup & Data Recovery**
   - One-click master JSON export of all personal studio records.
   - Validated backup restore with user confirmation.

10. **Security & Cloud Synchronization**
    - Secure private authentication (Supabase Auth + Web Crypto SHA-256).
    - No public registration, no public tournament rooms, no other users.
    - Strict database Row Level Security (`auth.uid() = user_id`) and private storage policies.

---

## 🚀 Running Locally

### Option 1: One-Click Launch (Windows)
Double-click `Launch Studio.bat`. It will launch the local server and open `http://localhost:5500/` in your browser.

### Option 2: PowerShell Server
Run the built-in socket server:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 5500
```

---

## ☁️ Connecting Supabase for Cross-Device Sync

1. Go to [https://supabase.com/](https://supabase.com/) and open your project (or create a free project).
2. Run the SQL migrations located in `supabase/migrations/`:
   - `supabase/migrations/20261014_init_nonchalant_studio.sql` (Creates tables & Row Level Security policies)
   - `supabase/migrations/20261014_storage_bucket.sql` (Creates private `gameplay-media` bucket)
3. In the studio navbar or Settings page:
   - Click the **Cloud Engine** pill or **Open Supabase Cloud Setup Dialog**.
   - Paste your **Supabase Project URL** and **Public Anon Key**.
   - Click **Test & Save Connection**.
4. All records and gameplay videos will now automatically sync to your private cloud database whenever you log in from your phone, laptop, or desktop!

---

## 🌐 Deploying to Vercel

The project is built with static Vanilla HTML5, CSS3, and ES6+ JavaScript, with Supabase loaded via CDN.

To deploy or update on Vercel:
```bash
git add .
git commit -m "Complete private eFootball gaming archive for NONCHALANT JR"
git push origin main
```
Vercel will automatically detect the static project and deploy the updated studio to `https://nonchalant-jr-studio.vercel.app/`.
