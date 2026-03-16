import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home }
    ],
  },
]);
