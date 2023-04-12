import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import { db } from "../utils/firebase";
import { db } from "../utils/api";
// import {
//   getDoc,
//   updateDoc,
//   arrayUnion,
//   arrayRemove,
//   doc,
// } from "firebase/firestore";
import {
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  doc,
} from "api/store";
import { cryptoKey } from "../constants";
import { sha256 } from "js-sha256";
import { LoadingOverlay } from "@mantine/core";
import TIME from "../utils/try";
import ReviewSubmittedReviews from "./reviews/ReviewSubmittedReviews";
const LandingPage = lazy(() => import("./landing/LandingPage"));
const RegisterPage = lazy(() => import("./register/RegisterPage"));
const ViewReviews = lazy(() => import("./reviews/ViewReviewsPage"));
const AboutPage = lazy(() => import("./about/AboutPage"));
const FavoritesPage = lazy(() => import("./favorites/FavoritesPage"));

// TODO: WHAT HAPPENS IF FIREBASE FAILS?
function RegisterandProtectedPages({ casUser }) {
  const [isLoading, setLoading] = useState(true);
  const [isValidated, setValidated] = useState(false);
  const [validatedUserObject, setUserObject] = useState(undefined);

  // VALIDATE USER ONCE//
  useEffect(() => {
    const validateUser = async (casUser) => {
      // Hash netId with stored cryptoKey
      const hash = sha256.hmac(cryptoKey, casUser.id);

      // Collection ref
      const usersCollectionRef = doc(db, "Users", hash);

      const userSnap = await getDoc(usersCollectionRef);

      if (userSnap.exists()) {
        setUserObject(userSnap.data());
        setValidated(true);
      }
      setLoading(false);
    };

    validateUser(casUser);
  }, [casUser]);

  const changeFavoritesOnUserObject = async (e) => {
    const favorites = e.favorites;
    setUserObject({
      ...validatedUserObject,
      meta: {
        favorites,
      },
    });

    //Update on firebase
    // Collection ref
    const usersCollectionRef = doc(db, "Users", validatedUserObject.netId);

    if (e.remove) {
      await updateDoc(usersCollectionRef, { favorites: arrayRemove(e.object) });
      // await updateDoc(usersCollectionRef, {
      //   "metafavorites": arrayRemove
      // })
    } else {
      await updateDoc(usersCollectionRef, { favorites: arrayUnion(e.object) });
    }
  };

  const handleAddReview = async (e) => {
    // Suites
    const roomReviewObject = {
      noise: e.noise,
      size: e.size,
      reviewYear: e.reviewYear,
      reviewerClassYear: e.reviewerClassYear,
      rec: e.rec,
      sw: e.sw,
    };

    const suiteCollectionRef = doc(
      db,
      "Suites",
      `${e.buildingName}-${e.suiteCode}`
    );
    await updateDoc(suiteCollectionRef, {
      [`${e.roomCode}.meta.roomReviewsToBeReviewed`]: arrayUnion(roomReviewObject),
    });

    for (const picLink of e.roomPictures) {
      await updateDoc(suiteCollectionRef, {
        [`${e.roomCode}.meta.picturesToBeReviewed`]: arrayUnion(picLink),
      });
    }
    // Reload window after uploading;
    window.location.reload(false);
  };

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <Suspense fallback={<LoadingOverlay visible={true} />}>
      <Routes>
        {/* For any other route, navigate back to home page */}
        <Route path="*" element={<Navigate to="/" />} />
        {/* If the user isn't logged in navigate to Landing page. Else navigate to review page */}
        <Route
          path="/"
          element={
            !casUser ? (
              <Navigate to="/logout" />
            ) : (
              <Navigate to="/viewreviews" />
            )
          }
        />
        <Route
          path="/viewreviews"
          element={
            isValidated ? (
              <ViewReviews
                user={validatedUserObject}
                handleUserObject={changeFavoritesOnUserObject}
                handleAddReview={handleAddReview}
              />
            ) : (
              <Navigate to="/register" />
            )
          }
        />
        {/* REGISTER USER */}
        <Route
          path="/register"
          element={
            !isValidated ? (
              <RegisterPage user={casUser} />
            ) : (
              <Navigate to="/viewreviews" />
            )
          }
        />
        <Route
          path="/favorites"
          element={
            isValidated ? (
              <FavoritesPage
                user={validatedUserObject}
                handleUserObject={changeFavoritesOnUserObject}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/about"
          element={<AboutPage user={validatedUserObject} />}
        />
        {/* Performs a soft logout so we don't actually log users out of cas */}
        <Route path="/logout" element={<LandingPage isLoggedIn={true} />} />
        <Route path="/upload" element={<TIME />} />
        <Route path="/reviewreviews" element={<ReviewSubmittedReviews user={validatedUserObject} />} />
        
      </Routes>
    </Suspense>
  );
}

export default RegisterandProtectedPages;
