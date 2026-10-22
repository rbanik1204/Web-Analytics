import { createBrowserRouter } from "react-router";
import App from "./App";
import { Landing } from "./pages/Landing";
import { Sessions } from "./pages/Sessions";
import { SessionEvents } from "./pages/SessionEvents";
import { Heatmap } from "./pages/Heatmap";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: "sessions",
        element: <Sessions />,
      },
      {
        path: "sessions/:session_id/events",
        element: <SessionEvents />,
      },
      {
        path: "heatmap",
        element: <Heatmap />,
      },
    ],
  },
]);

export default router;
