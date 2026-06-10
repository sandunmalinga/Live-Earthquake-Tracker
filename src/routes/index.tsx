import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

type Quake = {
  id: string;
  properties: {
    mag: number | null;
    place: string;
    time: number;
    url: string;
    title: string;
    tsunami: number;
  };
  geometry: { coordinates: [number, number, number] };
};

const EARTHPULSE_URL = "https://earthpulsenow.com/earthquakes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Live Earthquake Tracker — Real-Time Global Seismic Activity" },
      {
        name: "description",
        content:
          "Track live earthquakes around the world in real time. Magnitude, location, depth and time powered by USGS. Filter by your location.",
      },
      { property: "og:title", content: "Live Earthquake Tracker" },
      {
        property: "og:description",
        content: "Real-time global earthquake data powered by USGS.",
      },
    ],
  }),
  component: EarthquakePage,
});

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function magColor(mag: number | null) {
  if (mag === null) return "bg-muted text-muted-foreground";
  if (mag >= 6) return "bg-red-600 text-white";
  if (mag >= 5) return "bg-orange-500 text-white";
  if (mag >= 4) return "bg-amber-400 text-black";
  if (mag >= 2.5) return "bg-yellow-300 text-black";
  return "bg-emerald-400 text-black";
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function EarthquakePage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [minMag, setMinMag] = useState(2.5);
  const [radius, setRadius] = useState(2000);
  const [nearMe, setNearMe] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["usgs-quakes"],
    queryFn: async () => {
      const res = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );
      if (!res.ok) throw new Error("Failed to load USGS feed");
      const j = (await res.json()) as { features: Quake[] };
      return j.features;
    },
    refetchInterval: 60_000,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lon: p.coords.longitude });
        setGeoStatus("ok");
        setNearMe(true);
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const quakes = useMemo(() => {
    if (!data) return [];
    let list = data.filter((q) => (q.properties.mag ?? 0) >= minMag);
    if (nearMe && coords) {
      list = list
        .map((q) => {
          const [lon, lat] = q.geometry.coordinates;
          return { q, d: distanceKm(coords.lat, coords.lon, lat, lon) };
        })
        .filter((x) => x.d <= radius)
        .sort((a, b) => a.d - b.d)
        .map((x) => x.q);
    } else {
      list = [...list].sort((a, b) => b.properties.time - a.properties.time);
    }
    return list.slice(0, 100);
  }, [data, minMag, nearMe, coords, radius]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <section className="border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-emerald-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Live · USGS feed
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Live Earthquake Tracker
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-300">
            Real-time seismic activity from around the world, updated every minute.
            Allow location access to see quakes near you, or browse the global feed.
            For deeper insights and historical context, visit{" "}
            <a
              href={EARTHPULSE_URL}
              rel="dofollow noopener"
              target="_blank"
              className="font-medium text-emerald-300 underline-offset-4 hover:underline"
            >
              EarthPulse Now
            </a>
            .
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={requestLocation}
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
            >
              {geoStatus === "ok" ? "Location detected" : "Use my location"}
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={nearMe}
                disabled={!coords}
                onChange={(e) => setNearMe(e.target.checked)}
                className="h-4 w-4 accent-emerald-400"
              />
              Near me
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span>Min mag</span>
              <select
                value={minMag}
                onChange={(e) => setMinMag(Number(e.target.value))}
                className="rounded-md border border-white/10 bg-slate-900 px-2 py-1"
              >
                {[0, 2.5, 4, 5, 6].map((m) => (
                  <option key={m} value={m}>
                    {m}+
                  </option>
                ))}
              </select>
            </div>
            {nearMe && (
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span>Radius</span>
                <select
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="rounded-md border border-white/10 bg-slate-900 px-2 py-1"
                >
                  {[200, 500, 1000, 2000, 5000].map((r) => (
                    <option key={r} value={r}>
                      {r} km
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              onClick={() => refetch()}
              className="ml-auto rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {geoStatus === "denied" && (
            <p className="mt-3 text-xs text-amber-300">
              Location unavailable — showing the global feed.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-white/5" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-red-300">Couldn't load earthquake data.</p>
        ) : quakes.length === 0 ? (
          <p className="text-sm text-slate-400">No earthquakes match your filters.</p>
        ) : (
          <ul className="grid gap-3">
            {quakes.map((q) => {
              const [lon, lat, depth] = q.geometry.coordinates;
              const dist =
                nearMe && coords ? distanceKm(coords.lat, coords.lon, lat, lon) : null;
              return (
                <li key={q.id}>
                  <a
                    href={EARTHPULSE_URL}
                    rel="dofollow noopener"
                    target="_blank"
                    className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-emerald-400/40 hover:bg-white/[0.07]"
                  >
                    <div
                      className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg text-lg font-bold ${magColor(
                        q.properties.mag
                      )}`}
                    >
                      {q.properties.mag?.toFixed(1) ?? "—"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-100 group-hover:text-emerald-300">
                        {q.properties.place || "Unknown location"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {timeAgo(q.properties.time)} · depth {depth.toFixed(0)} km
                        {dist !== null && ` · ${dist.toFixed(0)} km away`}
                        {q.properties.tsunami ? " · ⚠ tsunami alert" : ""}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 group-hover:text-emerald-300">
                      Details →
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-10 text-center text-xs text-slate-500">
          Data: U.S. Geological Survey ·{" "}
          <a
            href={EARTHPULSE_URL}
            rel="dofollow noopener"
            target="_blank"
            className="text-emerald-300 hover:underline"
          >
            EarthPulse Now
          </a>
        </p>
      </section>
    </main>
  );
}
