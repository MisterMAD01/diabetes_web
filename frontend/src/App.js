import React from "react";
import Layout from "./components/Layout/Layout";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";
import { ToastContainer } from "react-toastify"; // ✅ import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // ✅ import style

function App() {
  return (
    <UserProvider>
      <Layout>
        <AppRoutes />
        <ToastContainer
          position="top-right" // ตำแหน่ง: top-right, top-center, bottom-right, ฯลฯ
          autoClose={3000} // ปิดอัตโนมัติใน 3 วินาที
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" // หรือ "dark", "colored"
        />
      </Layout>
    </UserProvider>
  );
}

export default App;
