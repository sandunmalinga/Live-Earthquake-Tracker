# Live-Earthquake-Tracker
A real-time global earthquake monitoring web application that fetches live seismic data from the USGS (United States Geological Survey) and displays earthquakes worldwide with location-based filtering

**Live Demo:** [https://earthquakes.lovable.app](https://earthquakes.lovable.app)
**For deeper earthquake insights and historical context, visit:**
[EarthPulse Now — https://earthpulsenow.com/earthquakes](https://earthpulsenow.com/earthquakes)
---
## Features
- **Real-Time Data** — Auto-refreshes every 60 seconds using the USGS earthquake feed
- **Global Coverage** — Displays earthquakes from around the world over the last 24 hours
- **Location-Based Filtering** — Uses browser geolocation to show earthquakes near the user
- **Magnitude Filtering** — Filter by minimum magnitude (0+, 2.5+, 4+, 5+, 6+)
- **Distance Radius** — Adjustable search radius (200–5000 km) when using "Near Me" mode
- **Visual Magnitude Indicators** — Color-coded magnitude badges (emerald → red)
- **Detailed Info** — Shows location, time (relative), depth, and tsunami alerts
- **Responsive Design** — Works on desktop and mobile devices
- **SEO Optimized** — Proper meta tags, Open Graph, and semantic HTML
---
## Tech Stack
| Technology | Purpose |
|-----------|---------|
| [TanStack Start](https://tanstack.com/start) | Full-stack React framework (SSR/SSG + server functions) |
| [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing |
| [TanStack Query](https://tanstack.com/query) | Server state management & caching |
| [React 19](https://react.dev) | UI library |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | UI component primitives |
| [USGS GeoJSON API](https://earthquake.usgs.gov) | Real-time earthquake data source |
---
## Getting Started
### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Bun](https://bun.sh/) (preferred package manager for this project)
### Installation
```bash
# Clone the repository
git clone <repo-url>
cd earthquake-tracker
# Install dependencies
bun install
# Start the development server
bun dev
```
The app will be available at `http://localhost:3000`.
### Build for Production
```bash
bun run build
```
---
## Data Source
Earthquake data is provided by the **U.S. Geological Survey (USGS)** via their public GeoJSON feed:
```
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
```
This endpoint returns all earthquakes recorded globally in the past 24 hours.
---
## Project Structure
```
├── src/
│   ├── components/ui/          # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities, API functions, config
│   ├── routes/                 # TanStack Start file-based routes
│   │   ├── index.tsx           # Homepage — Earthquake tracker
│   │   ├── __root.tsx          # Root layout (head, body shell)
│   │   └── ...                 # Additional routes
│   ├── styles.css              # Tailwind CSS + design tokens
│   ├── router.tsx              # Router configuration
│   └── server.ts / start.ts    # Server entry points
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```
---
## License
MIT — feel free to fork, modify, and use as you wish.
---
## Related
- **EarthPulse Now** — [https://earthpulsenow.com/earthquakes](https://earthpulsenow.com/earthquakes) — Deeper earthquake insights, historical data, and seismic analysis.
- **USGS Earthquake Hazards Program** — [https://earthquake.usgs.gov](https://earthquake.usgs.gov)
