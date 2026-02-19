# Offer For You

An interactive 3D house configurator for generating construction quotes. Built with React, Three.js, and a Node.js/SQLite backend.

## Features

- Interactive 3D house models (Rectangular, T-shaped, L-shaped, U-shaped)
- Switch between 1 and 2 floors
- Click on building parts (roof, walls, windows, etc.) to request a quote
- Corporate construction theme with Swedish localization
- Fully responsive down to 320px

## Tech Stack

**Frontend:** React 19, TypeScript, Three.js, Tailwind CSS, Vite
**Backend:** Node.js, Express, SQLite (better-sqlite3)
**Deployment:** GitHub Pages + Cloudflare Pages

## Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm start
```

Server runs at `http://localhost:3001`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Fetch all products |
| GET | `/api/products/search?q=term` | Search by name |
| POST | `/api/calculate` | Calculate offer total |

## Deployment

- **GitHub Pages:** `https://emilfloren96.github.io/offer-for-you/`
- **Cloudflare Pages:** `https://offer-for-you.pages.dev/`
