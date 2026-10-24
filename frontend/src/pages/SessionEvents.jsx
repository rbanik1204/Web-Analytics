import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function SessionEvents() {
  const { session_id } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/api/sessions/${encodeURIComponent(session_id)}/events`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json) => setEvents(json.events ?? []))
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [session_id]);

  return (
    <div className="w-[70vw] h-[90vh] bg-slate-500 rounded-xl p-6 flex flex-col gap-6 shadow-xl">
      <div className="flex items-center justify-between">
        <Link
          to="/sessions"
          className="w-16 text-sky-200 hover:text-white font-semibold transition-colors"
        >
          ← Back
        </Link>
        <h1 className="font-extrabold text-[30px] text-white">Events</h1>
        <div className="w-16" />
      </div>

      <div className="bg-inherit rounded-lg px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex flex-col min-w-0">
          <span className="text-slate-400 text-xs uppercase tracking-wide">
            Session ID
          </span>
          <span className="text-white font-mono text-sm truncate">
            {session_id}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-slate-400 text-xs uppercase tracking-wide">
            Total Events
          </span>
          <span className="text-sky-400 font-extrabold text-4xl">
            {loading ? "…" : events.length}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-3">
        <h2 className="text-white font-bold text-xl">All Events</h2>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
          {loading && <p className="text-slate-200">Loading events…</p>}
          {error && (
            <p className="text-red-300">Could not load events: {error}</p>
          )}
          {!loading && !error && events.length === 0 && (
            <p className="text-slate-200">No events for this session.</p>
          )}

          {events.map((e, i) => (
            <div
              key={e._id ?? `${e.timestamp}-${i}`}
              className="bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg px-4 py-3 grid grid-cols-[1fr_2fr_1fr_1.5fr] items-center gap-4"
            >
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Event Type
                </span>
                <span className="text-blue-400 font-bold text-lg">
                  {e.event_type}
                </span>
              </div>

              <div className="flex flex-col min-w-0">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Page URL
                </span>
                <span className="text-white text-sm truncate">
                  {e.page_url}
                </span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Coordinates
                </span>
                <span className="text-sky-400 font-mono text-sm">
                  {e.event_type === "click" && e.coordinates
                    ? `(${e.coordinates.x}, ${e.coordinates.y})`
                    : "—"}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Time
                </span>
                <span className="text-slate-200 text-sm">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
