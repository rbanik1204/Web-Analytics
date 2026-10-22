import { Navbar } from "./components/Navbar";
import { Header } from "./components/Header";
import { Sessions } from "./pages/Sessions";
import { SessionEvents } from "./pages/SessionEvents";
import { Heatmap } from "./pages/Heatmap";
import { Routes, Route, RouterProvider, Outlet } from "react-router";
import { Landing } from "./pages/Landing";
import router from "./router";

function App() {
  return (
    <div className="flex w-screen min-h-screen bg-black overflow-hidden">
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
