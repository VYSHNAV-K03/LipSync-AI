import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPanel from "./pages/Admin";
import Profile from "./pages/Profile";

import LipSync from "./pages/LipSync";
import Interactions from "./pages/Interactions";

const App = () => {
  return (
    <Router>
      <div className="bg-custom vh-100">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<LipSync />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/interactions" element={<Interactions />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
