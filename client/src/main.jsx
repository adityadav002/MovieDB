import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { lazy, Suspense } from "react";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext"; 
import NotFound from "./pages/NotFound.jsx";

const ShowList = lazy(() => import("./pages/ShowList.jsx"));
const Detail = lazy(() => import("./pages/Detail.jsx"));
const Favourite = lazy(() => import("./pages/Favourite.jsx"));
const WatchLater = lazy(() => import("./pages/WatchList.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Recommendations = lazy(() => import("./pages/Recommendations.jsx"));
const Profile = lazy(() => import("./components/Profile.jsx"));
const RegisterForm = lazy(() => import("./Auth/RegisterForm.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        index: true,
        element: (
          <ProtectedRoute>
            <ShowList />
          </ProtectedRoute>
        ),
      },
      {
        path: "detail/:id",
        element: <Detail />,
      },
      {
        path: "favourite",
        element: (
          <ProtectedRoute>
            <Favourite />
          </ProtectedRoute>
        ),
      },
      {
        path: "watchList",
        element: (
          <ProtectedRoute>
            <WatchLater />
          </ProtectedRoute>
        ),
      },
      {
        path: "/register",
        element: <RegisterForm />,
      },
      {
        path: "recommendations",
        element: (
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      }
    ]
  },
  { path: '*', element: <NotFound /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
