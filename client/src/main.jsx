import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ShowList from "./pages/ShowList.jsx";
import Detail from "./pages/Detail.jsx";
import Favourite from "./pages/Favourite.jsx";
import WatchLater from "./pages/WatchList.jsx";
import Home from "./pages/Home.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Profile from "./components/Profile.jsx";
import RegisterForm from "./Auth/RegisterForm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider } from "./context/AuthContext"; 
import NotFound from "./pages/NotFound.jsx";

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
