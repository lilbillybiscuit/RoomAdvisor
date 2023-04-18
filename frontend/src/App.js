import "./App.css";
import { useEffect, useState } from "react";
import LandingRegisterProtected from "./LandingRegisterProtected";
import { serverIp } from "./constants";
import { LoadingOverlay } from "@mantine/core";

function App() {
  const [isLoading, setLoading] = useState(true);
  const [casUser, setUser] = useState(null);

  useEffect(() => {
    const getUser = () => {
      fetch(`${serverIp}/auth/login/success`, {
        method: "GET",
        withCredentials: true,
        credentials: "include",
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) return response.json();
          throw new Error("Authentication has been failed!");
        })
        .then((resObject) => {
          setUser(resObject.user);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    getUser();
  }, []);

  // Make sure user object is fetched
  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }
  return <LandingRegisterProtected casUser={casUser} />;
}

export default App;
