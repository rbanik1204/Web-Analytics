import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import "./index.css";
import App from "./App.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <BrowserRouter>
      <App />
    </BrowserRouter> */}
    <RouterProvider router={router} />
  </StrictMode>,
);
