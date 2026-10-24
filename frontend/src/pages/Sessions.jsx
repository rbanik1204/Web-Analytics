import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/sessions"; // change to your endpoint

export function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadEvent, setLoadEvent] = useState(true);
  const [error, setError] = useState(null);
  const [sessionID, setSessionID] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((sessions) => {
        console.log(sessions.data);
        setSessions(sessions.data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);
  // if (sessionID) {
  //     useEffect(() => {
  //         const controller = new AbortController();
  //         fetch(`${import.meta.env.VITE_API_BASE_URL}/api/sessions/${sessionID}/events`, { signal: controller.signal }, {
  //             method: "GET",
  //             headers: {
  //                 "Content-Type": "application/json"
  //             }
  //         })
  //             .then((res) => (
  //                 res.json()))
  //             .then((events) => {
  //                 console.log(events);
  //                 setEvents(events)
  //             })
  //             .catch((err) => {
  //                 if (err.name !== "AbortError") setError(err.message);
  //             })
  //             .finally(() => setLoadEvent(false));
  //         return () => controller.abort();
  //     }, [])

  return (
    <div className="w-[70vw] h-[90vh] bg-slate-500 rounded-xl p-6 flex flex-col gap-6 shadow-xl">
      <h1 className="font-extrabold text-[30px] text-white text-center">
        Sessions
      </h1>

      {/* Total sessions card */}
      <div className="bg-inherit rounded-lg px-6 py-4 flex items-center justify-between">
        <span className="text-slate-300 font-semibold text-lg">
          Total Sessions
        </span>
        <span className="text-sky-400 font-extrabold text-4xl">
          {loading ? "…" : new Set(sessions.map((s) => s._id.session_id)).size}
        </span>
      </div>

      {/* Recent sessions */}
      <div className="flex-1 min-h-0 flex flex-col gap-3">
        <h2 className="text-white font-bold text-xl">Recent Sessions</h2>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
          {loading && <p className="text-slate-200">Loading sessions…</p>}

          {error && (
            <p className="text-red-300">Could not load sessions: {error}</p>
          )}

          {!loading && !error && sessions.length === 0 && (
            <p className="text-slate-200">No sessions yet.</p>
          )}
          {sessions.map((s) => (
            <div
              key={`${s._id.session_id}-${s._id.event_type}`}
              className="bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Session ID
                </span>
                <span className="text-white font-mono text-sm truncate">
                  {s._id.session_id}
                </span>
              </div>

              <div className="flex flex-col items-center ">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Event Type
                </span>
                <span className="text-blue-400 font-bold text-lg">
                  {s._id.event_type}
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-4">
                <span className="text-slate-400 text-xs uppercase tracking-wide">
                  Events
                </span>
                <span className="text-sky-400 font-bold text-lg">
                  {s.total_events}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
