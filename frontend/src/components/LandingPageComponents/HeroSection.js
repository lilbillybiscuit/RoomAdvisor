import "./HeroSection.css";
import React from "react";
import { Button } from "src/components/Button/Button";
import LoginComponent from "./Login";
import { Link } from "react-router-dom";

function HeroSection() {
  return (
    <div className="hero-container">
      <h1>Choosing a room just got easier</h1>

      <p>
        Room Advisor is a website where Yale students can candidly rate and
        review residential college rooms. We seek to improve the Yale housing
        experiences by empowering Yale students with information to help them
        find living spaces they love.
      </p>

      <div className="mobile-para">
        <div>
          Room Advisor is a website where Yale students can candidly rate and
          review residential college rooms. We seek to improve the Yale housing
          experiences by empowering Yale students with information to help them
          find living spaces they love.
        </div>
      </div>

      <div className="lg-screen-button">
        <Button buttonStyle="btn--primary" buttonSize="btn--medium">
          <LoginComponent/>
        </Button>
      </div>

      <div className="sm-screen-buttons">
        <div className="sm-screen-button">
          <Button buttonStyle="btn--primary" buttonSize="btn--medium">
            <LoginComponent/>
          </Button>
        </div>

        <div className="sm-screen-button">
          <Button buttonStyle="btn--primary" buttonSize="btn--medium">
            <Link to="/about" style={{ color: "white" }}>
              About
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
