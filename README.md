# NONCHALANT JR STUDIO 👑⚽
> **The Ultimate eFootball Gaming Control Centre & Tournament Arena**

NONCHALANT JR STUDIO is a dedicated command centre for eFootball players. Record gameplay highlights, manage dynamic tactical boards, track division milestones, celebrate trophies, and host real-time tournaments with your friends across mobile and PC.

---

## ✨ Features

- 🎮 **Match Vault & Video Highlights**: Log match results, record scores, tag competitions, and attach or stream high-definition gameplay clips directly via IndexedDB.
- 🏆 **Trophy Cabinet**: Showcase your championship honors, runner-up medals, and tournament history on a pedestal with glowing visual effects.
- ♟️ **Tactics Board & Game Plans**: Interactive football pitch with drag-and-drop player positioning, formation presets (4-2-1-3, 4-3-3, 3-2-4-1, 5-2-3, etc.), and individual attack/defense instructions.
- 👥 **Squad Builder & Roles**: Configure your Starting XI, substitutes bench, manager playstyles, and set-piece specialists (captains, penalties, free-kicks).
- 📈 **Live Analytics & Progress**: Dynamic points trajectory curve, win-rate doughnut visualization, and goals scored vs conceded charts.
- ⚔️ **Tournament Arena with Friends**: Create knockout tournaments and league standings. Generate shareable invite links, WhatsApp challenges, and instant QR codes for friends on mobile to register and play!
- ☁️ **Local & Cloud Sync**: Built-in HTTP socket server supporting local PC access, home Wi-Fi network streaming, and Cloudflare Public Tunnels.

---

## 🚀 Quick Start

### 1. Launch Studio (One-Click)
Double-click `Launch Studio.bat` to automatically start the background server and open the studio in your default browser.

### 2. Manual Terminal Launch
Run the PowerShell server directly:
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 5500
```

### 3. Access URLs
- **Local PC**: `http://localhost:5500/`
- **Home Wi-Fi (Phones & Tablets)**: `http://<your-wifi-ip>:5500/`
- **Public Cloud Tunnel**: Check `public_url.txt` or terminal output when Cloudflare tunnel is active.

---

## 🛠️ Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Canvas API, IndexedDB, CSS3 (Luxury Black & Gold Design System)
- **Backend**: Native PowerShell TCP socket server (`server.ps1`) with REST APIs (`/api/tournament`, `/api/join`, `/api/public-url`)
- **Networking**: Cloudflare Quick Tunnels for external friend invites

---

## 🔒 Privacy & Data
All match recordings, tactics, squad lineups, and trophies are stored locally in your browser (IndexedDB and LocalStorage) with full JSON backup export & restore support.
