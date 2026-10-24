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
    <div className="flex space-between pt-2">
      <div className="flex items-start gap-3">
        <img
          src="./assets/icons/bar-chart.png"
          className="ml-3 h-8 w-8 object-contain"
          alt="Web Analytics Icon"
        />
        <p className="text-[20px] mt-1 text-cyan-50 text-nowrap font-extrabold">
          Web <span>Analytics</span>
        </p>
      </div>

      <nav className="sticky mb-5 w-screen h-fit bg-transparent flex justify-center font-bold font-sans text-[18px] rounded-full">
        {links.map(({ to, label, end }) => (
          <NavLink key={label} to={to} end={end} className="group">
            {({ isActive }) => (
              <div
                className={`w-32 h-10 m-1 flex items-center justify-center rounded-md transition-colors
                                ${
                                  isActive
                                    ? "bg-pink-700 text-white shadow-xl rounded-full"
                                    : "text-green-900 group-hover:bg-sky-400 group-hover:text-white group-hover:rounded-xl"
                                }`}
              >
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
      <p className="text-[18px] h-fit text-cyan-50 rounded-full py-1 px-3 font-bold text-nowrap mr-3 bg-pink-600">
        Get Started
      </p>
    </div>
  );
}
