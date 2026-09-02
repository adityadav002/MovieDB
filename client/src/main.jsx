import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { lazy, Suspense } from "react";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext"; 
import NotFound from "./pages/NotFound.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";

const ShowList = lazy(() => import("./pages/ShowList.jsx"));
const Detail = lazy(() => import("./pages/Detail.jsx"));
const Favourite = lazy(() => import("./pages/Favourite.jsx"));
const WatchLater = lazy(() => import("./pages/WatchList.jsx"));
const Home = lazy(() => import("./pages/Home.jsx"));
const Recommendations = lazy(() => import("./pages/Recommendations.jsx"));
const Profile = lazy(() => import("./components/Profile.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const SignupPage = lazy(() => import("./pages/SignupPage.jsx"));

const Landing = lazy(() => import("./pages/Landing.jsx"));

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={<div className="global-loader">Loading...</div>}>
        <Landing />
      </Suspense>
    ),
  },
  {
    path: "/login",
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={<div className="global-loader">Loading...</div>}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    errorElement: <ErrorPage />,
    element: (
      <Suspense fallback={<div className="global-loader">Loading...</div>}>
        <SignupPage />
      </Suspense>
    ),
  },
  {
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/home",
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "/discover",
        element: (
          <ProtectedRoute>
            <ShowList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/detail/:id",
        element: <Detail />,
      },
      {
        path: "/favourite",
        element: (
          <ProtectedRoute>
            <Favourite />
          </ProtectedRoute>
        ),
      },
      {
        path: "/watchList",
        element: (
          <ProtectedRoute>
            <WatchLater />
          </ProtectedRoute>
        ),
      },
      {
        path: "/recommendations",
        element: (
          <ProtectedRoute>
            <Recommendations />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
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
