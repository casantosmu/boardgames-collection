import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { Boardgames } from "./features/boardgames/boardgames";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/boardgames" replace />,
  },
  {
    path: "/boardgames",
    element: <Boardgames />,
  },
  {
    path: "/login",
    lazy: () =>
      import("./features/auth/login").then((module) => ({
        Component: module.Login,
      })),
  },
  {
    path: "/register",
    lazy: () =>
      import("./features/auth/register").then((module) => ({
        Component: module.Register,
      })),
  },
]);

export const Router = (): JSX.Element => {
  return <RouterProvider router={router} />;
};
