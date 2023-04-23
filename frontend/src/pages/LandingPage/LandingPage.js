import React from "react";
import LoginObject from "src/services/authentication/LoginObject";
import {HeroSection, NavbarSection} from 'src/sections/LandingPage'

function LandingPage() {

  return (
    <>
      {/*<LoginObject />*/ /* This is not needed here, but it is a demonstration of how
      these pages should be structured */}
      <section className="landing-page-container">
        <NavbarSection/>
        <HeroSection/>
      </section>
    </>
  );
}

export default LandingPage;
