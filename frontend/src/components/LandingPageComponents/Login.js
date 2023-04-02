import React from "react";
import { serverIp } from "../../constants";
import { useNavigate } from "react-router-dom";

function LoginComponent({ isLoggedIn }) {
  const casLogin = () => {
    console.log("casLogin");
    window.open(`${serverIp}/auth/cas`, "_self");
  };

  const navigate = useNavigate();

  const redirectLogin = () => {
    navigate("/viewreviews");
  };

  return (
    <div className="login-button-container">
      <div
        className="login-button"
        onClick={!isLoggedIn ? casLogin : redirectLogin}
      >
        Login with CAS
      </div>
    </div>
  );
}

export default LoginComponent;
