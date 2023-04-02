import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./LandingPage";
import AboutPage from "./AboutPage";

export default function UnprotectedPages() {
  return (
    <Routes>
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/" element={<LandingPage isLoggedIn={false} />} />
      <Route path="/about" element={<AboutPage user={undefined} />} />
    </Routes>
  );
}
