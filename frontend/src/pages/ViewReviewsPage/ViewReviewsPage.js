import "src/pages/ViewReviewsPage/ViewReviewsPage.css";
import React, { Component } from "react";
import Nav from "src/components/Nav";
import Results from "src/components/ViewReviews/Results/Results";
import { codeToCollege, collegesToCode } from "src/services/data/colleges";
import CardsContainer from "src/components/ViewReviews/Suites/CardsContainer/CardsContainer";
import ModalContainer from "src/components/ViewReviews/GeneralModal";
import { db } from "src/services/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { LoadingOverlay } from "@mantine/core";
import floatingReview from "src/images/review_floating.png";
import ReviewRoomModal from "src/components/ViewReviews/AddReview/ReviewRoomModal";
import { HideOn } from "react-hide-on-scroll";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LoginObject from 'src/services/authentication/LoginObject'

// function testSuite() {
//   fetch('/api/suites', {
//     credentials: "include"
//   }).then(res => {
//     if(res.status === 200) {
//       console.log(res.json())
//       return res.json()
//     } 
//   })
// }

// testSuite();

// TO DO

class ViewReviews extends Component {
  // initial setup
  constructor(props) {
    super(props);
    var defaultRoomSizes;
    if (this.props.user.meta.classYear === 1) {
      defaultRoomSizes = [
        { value: 4, label: "Quad" },
        { value: 6, label: "Sextet" },
        { value: 8, label: "8-Pack" },
      ];
    } else if (this.props.user.meta.classYear === 2) {
      defaultRoomSizes = [
        { value: 1, label: "Single" },
        { value: 2, label: "Double" },
        { value: 4, label: "Quad" },
      ];
    } else if (this.props.user.meta.classYear === 3) {
      defaultRoomSizes = [
        { value: 1, label: "Single" },
        { value: 2, label: "Double" },
        { value: 4, label: "Quad" },
      ];
    } else {
      defaultRoomSizes = [{ value: 1, label: "Single" }];
    }

    const defaultState = {
      loading: true,
      showSubmitReviewModal: false,
      suites: [],
      allSuitesForSelectedCollege: [],
      favorites: this.props.user.favorites,
      oldBuildingState: {
        value: codeToCollege(this.props.user.meta.college),
        label: codeToCollege(this.props.user.meta.college),
      },
      building: {
        value: codeToCollege(this.props.user.meta.college),
        label: codeToCollege(this.props.user.meta.college),
      },
      roomSizes: defaultRoomSizes,
      searchItem: "",
      sortBy: { value: "ALPHA", label: "Sort by: Suite Name (A-Z)" },
    };

    if (!JSON.parse(window.localStorage.getItem("viewReviewsState"))) {
      this.state = defaultState;
    } else {
      var localState = JSON.parse(
        window.localStorage.getItem("viewReviewsState")
      );
      if (this.props.user.favorites !== localState.favorites) {
        localState.favorites = this.props.user.favorites;
      }
      this.state = localState;
    }

    // If we navigate to this page by only clicking on a college on the favorites page we want to change the college you see
    if (
      this.props.router.location.state &&
      codeToCollege(this.props.router.location.state.building) !==
        this.state.oldBuildingState.value
    ) {
      //Update building object here
      this.state.building = {
        value: codeToCollege(this.props.router.location.state.building),
        label: codeToCollege(this.props.router.location.state.building),
      };
      this.state.oldBuildingState = {
        value: codeToCollege(this.props.router.location.state.building),
        label: codeToCollege(this.props.router.location.state.building),
      };
      this.state.loading = true;
    }

    // Always set searchItem to empty
    this.state.searchItem = "";

    // Create suite state
    this.state.suites = this.filterRoomSize(
      this.state.roomSizes,
      this.state.allSuitesForSelectedCollege
    );
    this.state.suites = this.addFavoriteSuites(this.state.suites);

    // No of suites found
    this.state.noRoomsFound = this.state.suites.length;
  }

  setState(state) {
    window.localStorage.setItem("viewReviewsState", JSON.stringify(state));
    super.setState(state);
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

  componentDidMount() {
    document.addEventListener("click", this.handleModalOpen);

    // Update suite info practice
    // const t = doc(db, "Suites/BF-A12")

    // updateDoc(t, {
    //     "A12A.meta.pictures": arrayUnion("Done")
    //   })

    const suiteRef = collection(db, "Suites");
    const q = query(
      suiteRef,
      where("buildingName", "==", collegesToCode(this.state.building.value))
    );
    var suiteData = [];
    getDocs(q).then((data) => {
      data.forEach((docs) => {
        suiteData.push(docs.data());
      });

      const finalSuites = this.makeSuites(suiteData);
      this.setState({
        ...this.state,
        allSuitesForSelectedCollege: finalSuites,
        loading: false,
      });
    });
  }

  componentDidUpdate() {
    // Handle building change here
    if (this.state.building === this.state.oldBuildingState) return;

    const suiteRef = collection(db, "Suites");
    const q = query(
      suiteRef,
      where("buildingName", "==", collegesToCode(this.state.building.value))
    );
    var suiteData = [];
    getDocs(q).then((data) => {
      data.forEach((docs) => {
        suiteData.push(docs.data());
      });

      const finalSuites = this.makeSuites(suiteData);
      var suites = this.filterRoomSize(this.state.roomSizes, finalSuites);
      suites = this.addFavoriteSuites(suites);
      // No of suites found
      const noRoomsFound = suites.length;

      this.setState({
        ...this.state,
        allSuitesForSelectedCollege: finalSuites,
        suites,
        noRoomsFound,
        searchItem: "",
        oldBuildingState: this.state.building,
        loading: false,
      });
    });
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleModalOpen);
    // Remove any suites with persisted likes first
    const allSuitesForSelectedCollege = this.removeAllFavoriteSuites(
      this.state.allSuitesForSelectedCollege
    );
    this.setState({
      ...this.state,
      allSuitesForSelectedCollege,
      showSubmitReviewModal: false,
      loading: true,
    });
  }

  // Ensures that the body isn't scrollable whhen the modal is open
  handleModalOpen() {
    if (!document.querySelector(".modal")) {
      document.querySelector("body").style.removeProperty("overflow");
    } else {
      document.querySelector("body").style.overflow = "hidden";
    }
  }

  removeAllFavoriteSuites = (suites) => {
    var mySuites = suites;
    for (var suite of mySuites) {
      suite.favorited = false;
      suite.favoritedInside = false;
      for (var room of suite.suiteRooms) {
        room.meta.favorited = false;
      }
    }
    return mySuites;
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

  getSuiteRoomSize = (suite) => {
    var noBeds = 0;
    for (const room of suite.suiteRooms) {
      noBeds += room.meta.noBeds;
    }
    return noBeds;
  };

  filterRoomSize = (e, suites) => {
    var mySuites = [];
    if (e.length === 0) {
      // if no roomSize filter, return all rooms
      mySuites = mySuites.concat(suites);
    } else {
      for (const suite of suites) {
        for (const fav of e) {
          // If suite size satisfies criteria for size filter and in the same college
          if (this.getSuiteRoomSize(suite) === fav.value) {
            mySuites.push(suite);
            break;
          }
        }
      }
    }
    return mySuites;
  };

  // searches for room within a suite based on a string given
  roomNameSearchWithinSuite = (name, suite) => {
    for (const room of suite.suiteRooms) {
      if (
        room.roomCode.toLowerCase() === name.toLowerCase() ||
        room.roomCode.includes(name.toLowerCase())
      )
        return true;
    }
    return false;
  };

  filterSearch = (e, suites) => {
    var mySuites = [];
    for (const suite of suites) {
      if (
        suite.suiteCode.toLowerCase() === e.toLowerCase() ||
        suite.suiteCode.toLowerCase().includes(e.toLowerCase()) ||
        this.roomNameSearchWithinSuite(e, suite)
      ) {
        mySuites.push(suite);
      }
    }
    return mySuites;
  };

  // FAVORITE HANDLERS
  // Adds favorited suite/room to user object
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

  // Add Reviews Modal
  activateShowReviewModal = () => {
    return this.setState({ ...this.state, showSubmitReviewModal: true });
  };

  deactivateShowReviewModal = () => {
    return this.setState({ ...this.state, showSubmitReviewModal: false });
  };

  getAllRoomNamesInCurrentCollege = () => {
    var roomNames = [];
    for (const suite of this.state.allSuitesForSelectedCollege) {
      for (const room of suite.suiteRooms) {
        roomNames.push(room.roomCode);
      }
    }
    roomNames.sort();
    return roomNames;
  };

  findSuiteCodeForAddReview = (roomCode) => {
    for (const suite of this.state.allSuitesForSelectedCollege) {
      for (const room of suite.suiteRooms) {
        if (room.roomCode === roomCode) return suite.suiteCode;
      }
    }
  };

  handleAddReview = (e) => {
    const addReviewObject = {
      ...e,
      buildingName: collegesToCode(this.state.building.value),
      suiteCode: this.findSuiteCodeForAddReview(e.roomCode),
      reviewerClassYear: this.props.user.meta.classYear,
      reviewYear: new Date().getFullYear(),
    };
    this.props.handleAddReview(addReviewObject);
    this.deactivateShowReviewModal();
  };

  // IMPORTANT FILTERS!!

  handleBuildingChange = (e) => {
    //Set state to loading
    const building = e;

    // This is handled in the componentDidUpdate function
    return this.setState({ ...this.state, building, loading: true });
  };

  handleRoomSizeChange = (e) => {
    const roomSizes = e;
    // Then filter room sizes
    var suites = this.filterRoomSize(e, this.state.allSuitesForSelectedCollege);
    // Then favorite the suites
    suites = this.addFavoriteSuites(suites);
    // Update no rooms found
    const noRoomsFound = suites.length;

    // update value
    return this.setState({
      ...this.state,
      roomSizes,
      suites,
      noRoomsFound,
      searchItem: "",
    });
  };

  handleSearchChange = (e) => {
    const searchItem = e;
    var suites;
    //If a user searches for a blank string, they probably just wanna go back to where they were originally
    if (e === "") {
      suites = this.filterRoomSize(
        this.state.roomSizes,
        this.state.allSuitesForSelectedCollege
      );
    } else {
      // search by name
      suites = this.filterSearch(e, this.state.allSuitesForSelectedCollege);
    }

    // Then favorite the suites
    suites = this.addFavoriteSuites(suites);
    // Update no rooms found
    const noRoomsFound = suites.length;

    // update value
    return this.setState({ ...this.state, suites, noRoomsFound, searchItem });
  };

  handleSortByChange = (e) => {
    const sortBy = e;
    // update value: updating happens in the cards container
    return this.setState({ ...this.state, sortBy });
  };

  render() {
    return (
      <div>
        <LoginObject/>
        <Nav
          user={this.props.user}
          mode={"VERBOSE"}
          currState={this.state}
          handleBuildingChange={this.handleBuildingChange}
          handleRoomSizeChange={this.handleRoomSizeChange}
          handleSearchChange={this.handleSearchChange}
        />
        {this.state.loading ? (
          <LoadingOverlay visible={true} />
        ) : (
          <div>
            <Results
              noRooms={this.state.noRoomsFound}
              sortBy={this.state.sortBy}
              college={this.state.building.value}
              handleChange={this.handleSortByChange}
            />
            <CardsContainer
              suites={this.state.suites}
              sort={this.state.sortBy}
              handleAddFavorited={this.handleAddFavorited}
              handleRemoveFavorited={this.handleRemoveFavorited}
            />
          </div>
        )}

        {/* Logic for adding reviews */}
        <HideOn atHeight height={20}>
          <div
            onClick={this.activateShowReviewModal}
            className="floating-right-bottom-btn"
          >
            <img src={floatingReview} alt="review-a-room" />
          </div>
        </HideOn>

        <ModalContainer
          handleClose={this.deactivateShowReviewModal}
          isOpen={this.state.showSubmitReviewModal}
        >
          <ReviewRoomModal
            college={collegesToCode(this.state.building.value)}
            roomNames={this.getAllRoomNamesInCurrentCollege()}
            handleAddReview={this.handleAddReview}
          />
        </ModalContainer>
      </div>
    );
  }
}

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProp;
}

export default withRouter(ViewReviews);
