import "./HeroSection.css";
import React, { ReactPropTypes } from "react";
import { Button } from "../Button";
import LoginComponent from "./Login";
import { Link } from "react-router-dom";
import logo from "../../static/logo.png";

const messages = [
  {
    msg: "Rate and review Yale dorms",
  },
  {
    msg: "Communicate which rooms you want",
  },
  {
    msg: "Check noise, steep times, cleanliness, etc.",
  },
  {
    msg: "Coordinate with friends!",
  },
];

export default function HeroSection(props) {
  return (
    <div className="hero-container">
      <div className="landing-container">
        <img
          src={logo}
          alt="room-advisor-logo"
          style={{
            position: "relative",
            height: "100px",
            width: "220px",
            zIndex: "5",
            objectFit: "contain",
          }}
        />

        <ul className="landing-messages-container">
          {messages.map((msg) => (
            <li className="circle-checkmark">{msg.msg}</li>
          ))}
        </ul>

        <div className="landing-buttons-wrapper">
          <button
            className="landing-button-login"
            style={{ backgroundColor: "#0053c5" }}
          >
            <LoginComponent isLoggedIn={props.isLoggedIn} />
          </button>

          <Link to="/about" style={{ color: "white" }}>
            <button
              className="landing-button-about"
              style={{ backgroundColor: "#888888" }}
            >
              About
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// function HeroSection({ isLoggedIn }) {
//   return (
//     <div className="hero-container">
//       <h1>Choosing a room just got easier</h1>

//       <p>
//         Room Advisor is a website where Yale students can candidly rate and
//         review residential college rooms. We seek to improve the Yale housing
//         experiences by empowering Yale students with information to help them
//         find living spaces they love.
//       </p>

//       <div className="mobile-para">
//         <div>
//           Room Advisor is a website where Yale students can candidly rate and
//           review residential college rooms. We seek to improve the Yale housing
//           experiences by empowering Yale students with information to help them
//           find living spaces they love.
//         </div>
//       </div>

//       <div className="lg-screen-button">
//         <Button buttonStyle="btn--primary" buttonSize="btn--medium">
//           <LoginComponent isLoggedIn={isLoggedIn} />
//         </Button>
//       </div>

//       <div className="sm-screen-buttons">
//         <div className="sm-screen-button">
//           <Button buttonStyle="btn--primary" buttonSize="btn--medium">
//             <LoginComponent isLoggedIn={isLoggedIn} />
//           </Button>
//         </div>

//         <div className="sm-screen-button">
//           <Button buttonStyle="btn--primary" buttonSize="btn--medium">
//             <Link to="/about" style={{ color: "white" }}>
//               About
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HeroSection;
