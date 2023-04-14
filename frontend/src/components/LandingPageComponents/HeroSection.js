import "./HeroSection.css";
import React from "react";
import { Button } from "../Button";
import LoginComponent from "./Login";
import { Link } from "react-router-dom";

function HeroSection({ isLoggedIn }) {
  return (
    <div className="hero-container">
      <h1>Choosing a room just got easier</h1>

      {/* <p>
        Room Advisor is a website where Yale students can candidly rate and
        review residential college rooms. We seek to improve the Yale housing
        experiences by empowering Yale students with information to help them
        find living spaces they love.
      </p> */}

      <ul className="intro">
        <li>⭐️ Rate and review Yale dorms</li>
        <li>👯 Communicate which rooms you want</li>
        <li>🤔 Check noise, sleep times, cleanliness, etc.</li>
        <li>😎 Coordinate with friends! (maybe)</li>
      </ul>

      {/* <div className="mobile-para">
        <div>
          Room Advisor is a website where Yale students can candidly rate and
          review residential college rooms. We seek to improve the Yale housing
          experiences by empowering Yale students with information to help them
          find living spaces they love.
        </div>
      </div> */}

      <div className="lg-screen-button">
        <Button buttonStyle="btn--primary" buttonSize="btn--medium">
          <LoginComponent isLoggedIn={isLoggedIn} />
        </Button>
        <Button buttonStyle="btn--secondary" buttonSize="btn--medium">
          <Link to="/about" style={{ color: "white" }}>
            About
          </Link>
        </Button>
      </div>

      <div className="sm-screen-buttons">
        <Button buttonStyle="btn--primary" buttonSize="btn--medium">
          <LoginComponent isLoggedIn={isLoggedIn} />
        </Button>
        <Button buttonStyle="btn--secondary" buttonSize="btn--medium">
          <Link to="/about" style={{ color: "white" }}>
            About
          </Link>
        </Button>
      </div>
      
    </div>
  );
}

export default HeroSection;
