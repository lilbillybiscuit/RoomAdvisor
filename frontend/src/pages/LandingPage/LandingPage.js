import React from "react";
import LoginObject from "src/services/authentication/LoginObject";
import NavbarSection from "src/sections/LandingPage/NavbarSection/NavbarSection";
import LandingPageHeroSection from "src/sections/LandingPage/HeroSection/HeroSection";
import Footer from "src/components/Footer/Footer";

function LandingPage() {
  return (
    <>
      {/*<LoginObject />*/ /* This is not needed here, but it is a demonstration of how
      these pages should be structured */}
      <section className="landing-page-container">
        <NavbarSection/>
        <LandingPageHeroSection/>
        <Footer/>
      </section>

    </>
  );
}

export default LandingPage;
