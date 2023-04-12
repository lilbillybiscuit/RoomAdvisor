import React, { Component } from "react";
import Nav from "../../components/Nav";
// import { db } from "../../utils/firebase";
import { db } from "../../utils/api";
import nofavorites from "../../static/no-favorites.svg";
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
} from "firebase/firestore";
import CardsContainer from "../../components/ViewReviews/Suites/CardsContainer";
import { codeToCollege } from "../../utils/colleges";
import { LoadingOverlay } from "@mantine/core";
import { Link } from "react-router-dom";
import "./FavoritesPage.css";

export default class FavoritesPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      sortBy: { value: "ALPHA", label: "Sort by: Suite Name (A-Z)" },
      favorites: this.props.user.favorites,
      favoritedColleges: this.findUniqueFavoritedColleges(),
      suitesForColleges: [],
    };
  }

  componentDidMount() {
    document.addEventListener("click", this.handleModalOpen);

    var favoriteDocRefs = [];

    for (const fav of this.state.favorites) {
      favoriteDocRefs.push(`${fav.buildingName}-${fav.suiteCode}`);
    }

    // If there is nothing to search for return
    if (favoriteDocRefs.length === 0) {
      this.setState({ ...this.state, loading: false });
      return;
    }

    const suiteRef = collection(db, "Suites");
    const q = query(suiteRef, where(documentId(), "in", favoriteDocRefs));
    var suiteData = [];
    getDocs(q).then((data) => {
      data.forEach((docs) => {
        suiteData.push(docs.data());
      });

      var fetchedSuites = this.makeSuites(suiteData);
      fetchedSuites = this.addFavoriteSuites(fetchedSuites);

      const finalSuites = this.separateFavoritedSuitesByCollege(fetchedSuites);
      this.setState({
        ...this.state,
        suitesForColleges: finalSuites,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleModalOpen);
    this.setState({ ...this.state, loading: true });
  }

  findUniqueFavoritedColleges = () => {
    var colleges = [];
    for (const fav of this.props.user.favorites) {
      var unique = true;
      for (const college of colleges) {
        if (college === fav.buildingName) {
          unique = false;
          break;
        }
      }

      if (unique) {
        colleges.push(fav.buildingName);
      }
    }
    // Sort by college
    colleges.sort();
    return colleges;
  };

  separateFavoritedSuitesByCollege = (allSuites) => {
    var sepObjects = [];
    for (const college of this.state.favoritedColleges) {
      var collegeObject = {
        buildingName: college,
        suites: [],
      };

      for (const suite of allSuites) {
        if (suite.buildingName === college) {
          collegeObject.suites.push(suite);
        }
      }

      sepObjects.push(collegeObject);
    }
    return sepObjects;
  };

  handleModalOpen() {
    if (!document.querySelector(".modal")) {
      document.querySelector("body").style.removeProperty("overflow");
    } else {
      document.querySelector("body").style.overflow = "hidden";
    }
  }

  makeSuites = (suites) => {
    var finalSuites = [];
    for (const suite of suites) {
      var madeSuite = {
        buildingName: suite.buildingName,
        suiteCode: suite.suiteCode,
        favorited: false,
        favoritedInside: false,
        suiteRooms: [],
      };
      for (var room of suite.suiteRoomNames) {
        madeSuite.suiteRooms.push(suite[room]);
      }
      finalSuites.push(madeSuite);
    }
    return finalSuites;
  };

  // Favorite the suites that have been favorited by the user
  addFavoriteSuites = (suites) => {
    var mySuites = suites;
    for (var suite of mySuites) {
      for (const fav of this.state.favorites) {
        if (
          suite.buildingName === fav.buildingName &&
          suite.suiteCode === fav.suiteCode
        ) {
          // If we like a room within a suite, we don't want to like the entire suite
          // so only set suite to true if what we are handling is a suite ie no roomCode element
          if (fav.roomCode === undefined) {
            suite.favorited = true;
          } else {
            suite.favoritedInside = true;
            // If the room is a standalone single, you still want to favorite the entire suite
            if (suite.suiteRooms.length === 1) {
              suite.favorited = true;
            }
            for (var room of suite.suiteRooms) {
              if (room.roomCode === fav.roomCode) {
                room.meta.favorited = true;
              }
            }
          }
          // Handle for standalone singles
          if (suite.suiteRooms.length === 1)
            suite.suiteRooms[0].favorited = true;
        }
      }
    }
    return mySuites;
  };

  // FAVORITE HANDLERS
  handleAddFavorited = (e) => {
    var favorites = this.state.favorites;
    favorites.push(e);
    this.props.handleUserObject({
      object: e,
      favorites: favorites,
      remove: false,
    });
    this.setState({ ...this.state, favorites });
  };

  // Removes favorited suite/room from user object
  handleRemoveFavorited = (e) => {
    var favorites = this.state.favorites;
    var rmIdx = 0;
    if (e.roomCode === undefined) {
      // we are dealing with a suite
      for (var fav1 of favorites) {
        if (fav1.roomCode === undefined && fav1.suiteCode === e.suiteCode)
          break;
        rmIdx++;
      }
    } else {
      // we are dealing with a room
      for (var fav2 of favorites) {
        if (fav2.roomCode === e.roomCode && fav2.suiteCode === e.suiteCode)
          break;
        rmIdx++;
      }
    }

    favorites.splice(rmIdx, 1);
    this.props.handleUserObject({
      object: e,
      favorites: favorites,
      remove: true,
    });
    this.setState({ ...this.state, favorites });
  };

  render() {
    return (
      <div>
        <Nav user={this.props.user} />
        {this.state.loading ? (
          <LoadingOverlay visible={true} />
        ) : (
          <>
            {this.state.suitesForColleges.length === 0 ? (
              <div className="no-favorites-container">
                <img
                  className="no-favorites-image"
                  src={nofavorites}
                  alt="No favorites"
                />
                <p>
                  {" "}
                  You haven’t bookmarked any rooms yet! Save rooms and suites by
                  "bookmarking" them by clicking{" "}
                  <Link to="/viewreviews">here</Link>.
                </p>
              </div>
            ) : (
              <>
                <div className="page-title"> Favorite Suites </div>
                <p className="page-description">
                  {" "}
                  The suites you bookmarked will appear here.{" "}
                </p>
                {this.state.suitesForColleges.map((collegeObject) => (
                  <div key={collegeObject.buildingName}>
                    <div className="college-title">
                      <Link
                        to={"/viewreviews"}
                        state={{ building: collegeObject.buildingName }}
                      >
                        {codeToCollege(collegeObject.buildingName)}
                      </Link>
                    </div>
                    <div className="line-separator"></div>
                    <CardsContainer
                      suites={collegeObject.suites}
                      sort={this.state.sortBy}
                      handleAddFavorited={this.handleAddFavorited}
                      handleRemoveFavorited={this.handleRemoveFavorited}
                    />
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    );
  }
}
