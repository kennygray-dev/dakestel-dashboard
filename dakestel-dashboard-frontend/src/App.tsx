import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Orders from "./components/Orders";
import Metrics from "./components/Metrics";
import CreateOrder from "./components/CreateOrder";
import Login from "./components/Login";
import Navbar from "./components/Navbar";

// Authentication Checker
const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  return isAuthenticated() ? <>{element}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/orders" element={<ProtectedRoute element={<Orders />} />} />
        <Route path="/metrics" element={<ProtectedRoute element={<Metrics />} />} />
        <Route path="/create-order" element={<ProtectedRoute element={<CreateOrder />} />} />
      </Routes>
    </Router>
  );
};

export default App;
