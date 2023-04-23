import React from "react";

function LoginComponent() {
  const casLogin = () => {
    console.log("casLogin");
    window.open(`/api/auth/login`, "_self");
  };

  return (
    <div className="login-button-container">
      <div
        className="login-button"
        onClick={casLogin}
      >
        Login with CAS
      </div>
    </div>
  );
}

export default LoginComponent;
