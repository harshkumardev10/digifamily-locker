# 🔐 DigiFamily Locker

> A secure, cloud-synced family document vault — store, manage, and access important documents anywhere.

![DigiFamily Locker](https://img.shields.io/badge/Status-Live-brightgreen) ![Firebase](https://img.shields.io/badge/Firebase-Connected-orange) ![ImgBB](https://img.shields.io/badge/Images-ImgBB%20CDN-blue)

---

## ✨ Features

- 👨‍👩‍👧‍👦 **Multi-Member Vault** — Individual profile cards for each family member
- 📄 **Document Cards** — Store Aadhaar, PAN, Passport, driving license, marksheets & more
- 📷 **Photo Scanner** — Upload and crop document scans directly in the browser
- ☁️ **Firebase Cloud Sync** — Real-time sync across all devices via Firestore
- 🖼️ **ImgBB Photo Hosting** — Document images uploaded to ImgBB CDN (not local storage)
- 🔒 **Family Password Protection** — Password-locked family vault
- 🎨 **Beautiful UI** — Dark mode-ready, glassmorphism design
- 📱 **PWA** — Installable as a mobile app

---

## 🚀 Getting Started

```bash
git clone https://github.com/harshkumardev10/digifamily-locker.git
cd digifamily-locker
npm install
npm run dev
```

Open http://localhost:5173

**Default login:** username `ankit` / password `ankit`

---

## 🔥 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Build Tool | Vite |
| Cloud DB | Firebase Firestore |
| Image Hosting | ImgBB API |
| PWA | Service Worker + Web Manifest |

---

## 📁 Project Structure

```
digifamily-locker/
├── index.html        # Main app HTML
├── app.js            # Core application logic
├── style.css         # Styles & animations
├── public/
│   ├── manifest.json # PWA manifest
│   └── sw.js         # Service worker
└── vite.config.ts    # Vite config
```

---

## 🌐 Live

> Deploy via Firebase Hosting or Vercel for a shareable link.

---

*Built with ❤️ for the Rajoriya family*