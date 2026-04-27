import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router";
import { Login } from "@pages/login";
import { DefaultLayout } from "./app/layout/default-layout";
import { ApplicationPage } from "./pages/applications";
import { CreateApplicationPage } from "./pages/create-application";
import { ApplicationDetailsPage } from "./pages/application-details";
import { FillLiftPage } from "./pages/fill-lift";
import { OperatorPanelPage } from "./pages/operator-panel";
import { selectAuth, selectIsAuthenticated, useMeQuery } from "./entities/auth";
import { useAppSelector } from "./app/store/hooks";

const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

const PublicRoute = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { user, role } = useAppSelector(selectAuth);
  const effectiveRole = user?.role ?? role;
  const redirectPath = effectiveRole === "admin" ? "/operator-panel" : "/applications";

  return isAuthenticated ? <Navigate to={redirectPath} replace /> : <Outlet />;
};

function App() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  useMeQuery(undefined, { skip: !isAuthenticated });

  const router = createBrowserRouter([
    {
      path: "/",
      element: <PublicRoute />,
      children: [{ index: true, element: <Login /> }],
    },
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          element: <DefaultLayout />,
          children: [
            {
              path: "applications",
              element: <ApplicationPage />,
            },        
            {
              path: "application/:applicationId",
              element: <ApplicationDetailsPage />,
            },
            {
              path: "create-application",
              element: <CreateApplicationPage />,
            },
            {
              path: "fill-lift",
              element: <FillLiftPage />,
            },
            {
              path: "operator-panel",
              element: <OperatorPanelPage />,
            },
          ],
        },
      ],
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;
