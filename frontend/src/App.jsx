import { Navbar } from "./components/Navbar";
import { Outlet } from "react-router";

function App() {
  return (
    <div className="flex w-screen min-h-screen bg-slate-500 overflow-hidden">
      <Navbar />
      <main className="flex-1 flex justify-center items-center">
        {/* <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route
            path="/sessions/:session_id/events"
            element={<SessionEvents />}
          />
          <Route path="/heatmap" element={<Heatmap />} />
        </Routes> */}
        <Outlet />
      </main>
    </div>
  );
}

export default App;
