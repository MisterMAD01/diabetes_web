import React from "react";
import Layout from "./components/Layout/Layout";
import AppRoutes from "./routes/AppRoutes";
import TestApi from "./TestApi";

function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}



export default App;
