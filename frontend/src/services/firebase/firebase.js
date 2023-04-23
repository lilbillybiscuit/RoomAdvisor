// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZQXtrnk8HbMbPGZOyHwkEi2XKWTO6AjE",
  authDomain: "room-advisor-v0.firebaseapp.com",
  databaseURL: "https://room-advisor-v0-default-rtdb.firebaseio.com",
  projectId: "room-advisor-v0",
  storageBucket: "room-advisor-v0.appspot.com",
  messagingSenderId: "185467364590",
  appId: "1:185467364590:web:3350787105a8a970da3fff",
  measurementId: "G-XFWPFN8DEH",
};

// // Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
