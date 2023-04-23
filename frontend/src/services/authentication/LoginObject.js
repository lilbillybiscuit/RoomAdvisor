// create a login object
import { useState, useEffect } from "react";
import checkAuth from "./login";

// return a React component that will be used to check if the user is logged in
export default function LoginObject() {
  useEffect(() => {
    checkAuth().then((res) => {
      if (!res) {
        window.open("/", "_self");
      }
    });
  });

  // return the component
  return <></>;
}
