/** @format */

import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./style/toast.css";

function App() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />

      {/* ─── SINGLE GLOBAL TOAST CONTAINER ─── */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Slide}
        limit={5}
        role="alert"
        aria-live="assertive"
      />
    </>
  );
}

export default App;
