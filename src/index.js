import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import ErrorPage from "./Utils/ErrorPage"
import App from "./Pages/App";
import Room from "./Pages/Room";
import JoinRoom from "./Pages/JoinRoom";


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/:roomid",
    element: <Room />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/joinroom/:roomid",
    element: <JoinRoom />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);