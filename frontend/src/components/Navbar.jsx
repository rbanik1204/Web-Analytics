import { useEffect, useState } from "react";
import { NavLink, useMatch } from "react-router";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function Navbar() {
  const match = useMatch("/sessions/:session_id/events");
  const currentId = match?.params.session_id;
  const [randomId, setRandomId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/api/sessions`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((json) => {
        const ids = [
          ...new Set((json.data ?? []).map((s) => s._id.session_id)),
        ];
        if (ids.length > 0) {
          setRandomId(ids[Math.floor(Math.random() * ids.length)]);
        }
      })
      .catch(() => {}); // Events link just stays hidden if this fails

    return () => controller.abort();
  }, []);

  const sessionId = currentId ?? randomId;

  const links = [
    { to: "/", label: "Home" },
    { to: "/sessions", label: "Sessions", end: true },
    ...(sessionId
      ? [
          {
            to: `/sessions/${encodeURIComponent(sessionId)}/events`,
            label: "Events",
          },
        ]
      : []),
    { to: "/heatmap", label: "Heatmap" },
  ];

  return (
    <nav className="absolute top-0 w-[100%] flex justify-center bg-white font-bold font-sans text-[18px]">
      {links.map(({ to, label, end }) => (
        <NavLink key={label} to={to} end={end} className="group">
          {({ isActive }) => (
            <div
              className={`w-32 h-10 m-1 flex items-center justify-center rounded-md transition-colors
                                ${
                                  isActive
                                    ? "bg-pink-700 text-white"
                                    : "text-green-900 group-hover:bg-sky-400 group-hover:text-white"
                                }`}
            >
              {label}
            </div>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
