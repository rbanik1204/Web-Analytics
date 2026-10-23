import { Link } from "react-router";

const features = [
  {
    to: "/sessions",
    title: "Sessions",
    desc: "Browse every tracked session and see how many events each one recorded.",
  },
  {
    to: "/heatmap",
    title: "Heatmap",
    desc: "Spot the busiest sessions by clicks and see page views per URL.",
  },
];

export function Landing() {
  return (
    <div className="flex flex-col justify-center items-center gap-[30vh]">
      <div className="flex flex-col justify-center items-center gap-7">
        <h1 className="font-extrabold text-5xl text-white">
          Welcome to <span className="text-sky-300">Web Analytics</span>
        </h1>
        <p className="text-slate-200 text-lg  text-center max-w-xl">
          Track how visitors use your site: sessions, clicks and page views, all
          in one place.
        </p>
        <h1 style={{ fontSize: "30px" }} align="center">
          UNDER CONSTRUCTION!
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="bg-slate-700 hover:bg-sky-400 group transition-colors rounded-lg p-5 flex flex-col gap-2 text-left"
          >
            <span className="text-sky-400 group-hover:text-white font-bold text-xl">
              {f.title} →
            </span>
            <span className="text-slate-300 group-hover:text-white text-sm">
              {f.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
