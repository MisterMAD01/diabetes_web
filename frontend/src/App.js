import React from "react";
import Layout from "./components/Layout/Layout";
import AppRoutes from "./routes/AppRoutes";
import { UserProvider } from "./contexts/UserContext";  // import ให้ถูกต้องตามพาธไฟล์จริง

function App() {
  return (
    <UserProvider>
      <Layout>
        <AppRoutes />
      </Layout>
    </UserProvider>
  );
}

export default App;
