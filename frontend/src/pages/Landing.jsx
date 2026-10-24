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
    <div className="w-full">
      <div className="w-[100%] min-h-screen flex flex-col justify-start items-center gap-[30vh]">
        <div className="flex flex-col justify-center items-center">
          <p className="w-fit bg-[#1E293B] p-2 my-4 rounded-full text-sky-300">
            YOUR WEBSITE, UNDERSTOOD
          </p>
          <h1 className="font-extrabold text-5xl text-white">
            Welcome to <span className="text-sky-300">Web Analytics</span>
          </h1>
          <p className="text-slate-200 text-lg mt-1 text-center max-w-xl">
            Track how visitors use your site: sessions, clicks and page views,
            all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-5 w-full max-w-2xl">
          {features.map((f) => (
            <Link
              key={f.to}
              to={f.to}
              className="bg-slate-700 hover:bg-sky-300 group transition-colors rounded-lg p-10 flex flex-col gap-2 text-left"
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
      <div className="w-full min-h-screen bg-white"></div>
    </div>
  );
}
