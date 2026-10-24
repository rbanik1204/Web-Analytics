import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// intensity 0..1 -> blue (cold) to red (hot)
const heatColor = (t) => `hsl(${220 - t * 220}, 80%, ${45 + (1 - t) * 5}%)`;

export function Heatmap() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selected, setSelected] = useState("");
  const [pageViews, setPageViews] = useState([]);
  const [pvLoading, setPvLoading] = useState(false);
  const [pvError, setPvError] = useState(null);

  const [allEvents, setAllEvents] = useState([]);
  const [evLoading, setEvLoading] = useState(false);
  const [query, setQuery] = useState("");

  // 1. all sessions (counts per session_id + event_type)
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/api/sessions`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json) => {
        const data = json.data ?? [];
        setRows(data);
        if (data.length > 0) setSelected(data[0]._id.session_id);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // 2. events of the selected session -> page views per page_url
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    setPvLoading(true);
    setPvError(null);

    fetch(`${API_BASE}/api/sessions/${encodeURIComponent(selected)}/events`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json) => {
        const counts = {};
        (json.events ?? [])
          .filter((e) => e.event_type === "page_view")
          .forEach((e) => {
            counts[e.page_url] = (counts[e.page_url] ?? 0) + 1;
          });
        const list = Object.entries(counts)
          .map(([page_url, views]) => ({ page_url, views }))
          .sort((a, b) => b.views - a.views);
        setPageViews(list);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setPvError(err.message);
      })
      .finally(() => setPvLoading(false));

    return () => controller.abort();
  }, [selected]);

  // 3. events of ALL sessions (used by the URL search)
  useEffect(() => {
    const ids = [...new Set(rows.map((r) => r._id.session_id))];
    if (ids.length === 0) return;

    const controller = new AbortController();
    setEvLoading(true);

    Promise.all(
      ids.map((id) =>
        fetch(`${API_BASE}/api/sessions/${encodeURIComponent(id)}/events`, {
          signal: controller.signal,
        })
          .then((res) => (res.ok ? res.json() : { events: [] }))
          .then((json) =>
            (json.events ?? []).map((e) => ({
              ...e,
              session_id: e.session_id ?? id,
            })),
          )
          .catch(() => []),
      ),
    )
      .then((lists) => setAllEvents(lists.flat()))
      .finally(() => setEvLoading(false));

    return () => controller.abort();
  }, [rows]);

  // ---- existing session view data ----
  const clicks = rows
    .filter((r) => r._id.event_type === "click")
    .sort((a, b) => b.total_events - a.total_events);
  const sessionIds = [...new Set(rows.map((r) => r._id.session_id))];

  const maxClicks = Math.max(1, ...clicks.map((c) => c.total_events));
  const totalClicks = clicks.reduce((sum, c) => sum + c.total_events, 0);
  const maxViews = Math.max(1, ...pageViews.map((p) => p.views));
  const totalViews = pageViews.reduce((sum, p) => sum + p.views, 0);

  // ---- URL search data ----
  const q = query.trim().toLowerCase();
  const knownUrls = useMemo(
    () => [...new Set(allEvents.map((e) => e.page_url).filter(Boolean))],
    [allEvents],
  );

  const urlStats = useMemo(() => {
    if (!q) return null;
    const matches = allEvents.filter((e) =>
      e.page_url?.toLowerCase().includes(q),
    );

    const byUrl = {};
    const bySession = {};
    let views = 0;
    let clickCount = 0;

    matches.forEach((e) => {
      const u = (byUrl[e.page_url] ??= {
        page_url: e.page_url,
        views: 0,
        clicks: 0,
      });
      const s = (bySession[e.session_id] ??= {
        session_id: e.session_id,
        views: 0,
        clicks: 0,
      });
      if (e.event_type === "page_view") {
        u.views++;
        s.views++;
        views++;
      }
      if (e.event_type === "click") {
        u.clicks++;
        s.clicks++;
        clickCount++;
      }
    });

    const urls = Object.values(byUrl).sort(
      (a, b) => b.views + b.clicks - (a.views + a.clicks),
    );
    const sessions = Object.values(bySession).sort(
      (a, b) => b.views + b.clicks - (a.views + a.clicks),
    );

    return {
      views,
      clicks: clickCount,
      sessionCount: sessions.length,
      urls,
      sessions,
      maxUrl: Math.max(1, ...urls.map((u) => u.views + u.clicks)),
      maxSession: Math.max(1, ...sessions.map((s) => s.views + s.clicks)),
    };
  }, [allEvents, q]);

  return (
    <div className="w-[70vw] h-[90vh] bg-inherit rounded-xl p-6 flex flex-col gap-5 shadow-xl">
      <h1 className="font-extrabold text-[30px] text-white text-center">
        Heatmap
      </h1>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          list="known-urls"
          placeholder="Search a page URL, e.g. /pricing or https://example.com/about"
          className="w-full bg-slate-700 text-white placeholder-slate-400 rounded-lg pl-4 pr-10 py-3 outline-none focus:ring-2 focus:ring-sky-400"
        />
        <datalist id="known-urls">
          {knownUrls.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white text-xl leading-none"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {q ? (
        /* ---------- URL analytics view ---------- */
        <div className="flex-1 min-h-0 flex flex-col gap-4">
          {evLoading && (
            <p className="text-slate-200">Loading events from all sessions…</p>
          )}

          {!evLoading && urlStats && urlStats.urls.length === 0 && (
            <p className="text-slate-200">
              No events found for URLs matching “{query.trim()}”.
            </p>
          )}

          {!evLoading && urlStats && urlStats.urls.length > 0 && (
            <>
              <div className="grid grid-cols-3 gap-4">
                {[
                  ["Page Views", urlStats.views],
                  ["Clicks", urlStats.clicks],
                  ["Sessions", urlStats.sessionCount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="bg-slate-700 rounded-lg px-5 py-3 flex items-center justify-between"
                  >
                    <span className="text-slate-300 font-semibold">
                      {label}
                    </span>
                    <span className="text-sky-400 font-extrabold text-3xl">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex-1 min-h-0 grid grid-cols-2 gap-6">
                {/* Matching URLs */}
                <div className="min-h-0 flex flex-col gap-3">
                  <h2 className="text-white font-bold text-xl">
                    Matching URLs
                  </h2>
                  <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                    {urlStats.urls.map((u) => (
                      <div
                        key={u.page_url}
                        className="bg-slate-700 rounded-lg px-4 py-3 flex flex-col gap-2"
                      >
                        <span
                          className="text-white text-sm truncate"
                          title={u.page_url}
                        >
                          {u.page_url}
                        </span>
                        <div className="flex gap-4 text-xs text-slate-300">
                          <span>
                            Views{" "}
                            <b className="text-sky-400 text-sm">{u.views}</b>
                          </span>
                          <span>
                            Clicks{" "}
                            <b className="text-pink-400 text-sm">{u.clicks}</b>
                          </span>
                        </div>
                        <div className="h-2 bg-slate-600 rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${((u.views + u.clicks) / urlStats.maxUrl) * 100}%`,
                              backgroundColor: heatColor(
                                (u.views + u.clicks) / urlStats.maxUrl,
                              ),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sessions that hit it */}
                <div className="min-h-0 flex flex-col gap-3">
                  <h2 className="text-white font-bold text-xl">Sessions</h2>
                  <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                    {urlStats.sessions.map((s) => (
                      <div
                        key={s.session_id}
                        className="bg-slate-700 rounded-lg px-4 py-3 flex flex-col gap-2"
                      >
                        <span
                          className="text-white font-mono text-xs truncate"
                          title={s.session_id}
                        >
                          {s.session_id}
                        </span>
                        <div className="flex gap-4 text-xs text-slate-300">
                          <span>
                            Views{" "}
                            <b className="text-sky-400 text-sm">{s.views}</b>
                          </span>
                          <span>
                            Clicks{" "}
                            <b className="text-pink-400 text-sm">{s.clicks}</b>
                          </span>
                        </div>
                        <div className="h-2 bg-slate-600 rounded overflow-hidden">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${((s.views + s.clicks) / urlStats.maxSession) * 100}%`,
                              backgroundColor: heatColor(
                                (s.views + s.clicks) / urlStats.maxSession,
                              ),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* ---------- Original session view ---------- */
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700 rounded-lg px-6 py-4 flex items-center justify-between">
              <span className="text-slate-300 font-semibold text-lg">
                Total Clicks
              </span>
              <span className="text-sky-400 font-extrabold text-4xl">
                {loading ? "…" : totalClicks}
              </span>
            </div>
            <div className="bg-slate-700 rounded-lg px-6 py-4 flex items-center justify-between">
              <span className="text-slate-300 font-semibold text-lg">
                Page Views (session)
              </span>
              <span className="text-sky-400 font-extrabold text-4xl">
                {pvLoading ? "…" : totalViews}
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-0 grid grid-cols-2 gap-6">
            {/* Left: clicks by session */}
            <div className="min-h-0 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-xl">
                  Clicks by Session
                </h2>
                <div className="flex items-center gap-2 text-slate-200 text-xs">
                  <span>Minor</span>
                  <div
                    className="w-16 h-2 rounded"
                    style={{
                      background: `linear-gradient(to right, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})`,
                    }}
                  />
                  <span>Major</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2">
                {loading && <p className="text-slate-200">Loading…</p>}
                {error && (
                  <p className="text-red-300">Could not load data: {error}</p>
                )}
                {!loading && !error && clicks.length === 0 && (
                  <p className="text-slate-200">No click events yet.</p>
                )}

                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                  {clicks.map((c) => {
                    const id = c._id.session_id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSelected(id)}
                        className={`rounded-lg p-4 text-left text-white flex flex-col gap-1 shadow-md transition-transform hover:scale-105 ${
                          id === selected ? "ring-4 ring-white" : ""
                        }`}
                        style={{
                          backgroundColor: heatColor(
                            c.total_events / maxClicks,
                          ),
                        }}
                        title={id}
                      >
                        <span className="text-3xl font-extrabold">
                          {c.total_events}
                        </span>
                        <span className="text-xs uppercase tracking-wide opacity-90">
                          clicks
                        </span>
                        <span className="font-mono text-xs truncate opacity-80 w-full">
                          {id}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: page views by page_url for the selected session */}
            <div className="min-h-0 flex flex-col gap-3">
              <h2 className="text-white font-bold text-xl">
                Page Views by URL
              </h2>

              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="bg-slate-700 text-white font-mono text-sm rounded-lg px-3 py-2 outline-none"
              >
                {sessionIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>

              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                {pvLoading && <p className="text-slate-200">Loading…</p>}
                {pvError && (
                  <p className="text-red-300">
                    Could not load page views: {pvError}
                  </p>
                )}
                {!pvLoading &&
                  !pvError &&
                  selected &&
                  pageViews.length === 0 && (
                    <p className="text-slate-200">
                      No page views in this session.
                    </p>
                  )}

                {pageViews.map((p) => (
                  <div
                    key={p.page_url}
                    className="bg-slate-700 rounded-lg px-4 py-3 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span
                        className="text-white text-sm truncate"
                        title={p.page_url}
                      >
                        {p.page_url}
                      </span>
                      <span className="text-sky-400 font-bold text-lg shrink-0">
                        {p.views}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-600 rounded overflow-hidden">
                      <div
                        className="h-full rounded"
                        style={{
                          width: `${(p.views / maxViews) * 100}%`,
                          backgroundColor: heatColor(p.views / maxViews),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
