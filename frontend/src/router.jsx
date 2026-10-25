import { createBrowserRouter } from "react-router";
import App from "./App";
import PageLoader from "./components/PageLoader";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        HydrateFallback: PageLoader,
        lazy: async () => {
          const { Landing } = await import("./pages/Landing");
          return { Component: Landing };
        },
      },
      {
        path: "sessions",
        HydrateFallback: PageLoader,
        lazy: async () => {
          const { Sessions } = await import("./pages/Sessions");
          return { Component: Sessions };
        },
      },
      {
        path: "sessions/:session_id/events",
        HydrateFallback: PageLoader,
        lazy: async () => {
          const { SessionEvents } = await import("./pages/SessionEvents");
          return { Component: SessionEvents };
        },
      },
      {
        path: "heatmap",
        HydrateFallback: PageLoader,
        lazy: async () => {
          const { Heatmap } = await import("./pages/Heatmap");
          return { Component: Heatmap };
        },
      },
    ],
  },
]);

export default router;
