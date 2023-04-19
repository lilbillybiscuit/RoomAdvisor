import React from "react";
import HeroSection from "../components/LandingPageComponents/HeroSection.js";
import "./LandingPage.css";
import Nav from "../components/Nav";

function LandingPage({ isLoggedIn }) {
  return (
    <section className="landing-page-container">
      <Nav user={undefined} mode={"TRUNCATED"} />
      <div className="hero">
        <HeroSection isLoggedIn={isLoggedIn} />
      </div>
      <Footer />
    </section>
  );
}

function Footer() {
  return (
    <footer className={"footer-container"}>
      <div className={"footer-content-wrapper"}>
        <p className={"footer-title"}>Room Advisor | © 2023</p>
      </div>
    </footer>
  );
}

export default LandingPage;
