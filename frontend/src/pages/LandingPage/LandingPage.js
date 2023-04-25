import React from "react";
import LandingPageHeroSection from "src/sections/LandingPage/HeroSection/HeroSection";
import Footer from "src/components/Footer/Footer";

function LandingPage() {
  return (
    <>
      <section className="landing">
        <LandingPageHeroSection/>
        <Footer/>
      </section>
    </>
  );
}

export default LandingPage;
