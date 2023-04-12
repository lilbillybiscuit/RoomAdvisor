import React from "react";
import HeroSection from "../../components/LandingPageComponents/HeroSection";
import Nav from "../../components/Nav";

function LandingPage({ isLoggedIn }) {
  return (
    <section className="landing-page-container">
      <Nav user={undefined} mode={"TRUNCATED"} />
      <div className="hero">
        <HeroSection isLoggedIn={isLoggedIn} />
      </div>
    </section>
  );
}

export default LandingPage;
