import "src/components/ViewReviews/Suites/CardsContainer/CardsContainer.css";
import React, { Component } from "react";
import SuiteCard from "src/components/ViewReviews/Suites/SuiteCard/SuiteCard";

export default class CardsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      suites: this.sortSuites(this.props.sortBy, this.props.suites),
    };
  }

  componentDidUpdate(prevProps) {
    // If the suite props or sortBy props have been updated update the suites being shown
    // Also sort the new suites based on the persisted sort value
    if (prevProps !== this.props) {
      this.setState({
        suites: this.sortSuites(this.props.sort.value, this.props.suites),
      });
    }
  }

  updateSuiteFavorited = (e) => {
    //If we have a standalone suite, use the room favorited function instead
    if (e.roomCode) {
      this.updateRoomFavorited(e);
      return;
    }

    // Send to be added/removed from user object
    if (e.favorited) {
      this.props.handleAddFavorited({
        suiteCode: e.suiteCode,
        buildingName: e.buildingName,
      });
    } else {
      this.props.handleRemoveFavorited({
        suiteCode: e.suiteCode,
        buildingName: e.buildingName,
      });
    }

    for (var suite of this.state.suites) {
      if (suite.suiteCode === e.suiteCode) {
        suite.favorited = e.favorited;
        if (suite.suiteRooms.length === 1)
          suite.suiteRooms[0].meta.favorited = e.favorited;
        break;
      }
    }
    this.setState({ suites: this.state.suites });
  };

  updateRoomFavorited = (e) => {
    if (e.favorited) {
      this.props.handleAddFavorited({
        suiteCode: e.suiteCode,
        roomCode: e.roomCode,
        buildingName: e.buildingName,
      });
    } else {
      this.props.handleRemoveFavorited({
        suiteCode: e.suiteCode,
        roomCode: e.roomCode,
        buildingName: e.buildingName,
      });
    }

    var mySuites = this.state.suites;

    for (var suite of mySuites) {
      if (suite.suiteCode === e.suiteCode) {
        // Update room favorite status
        for (var room1 of suite.suiteRooms) {
          if (room1.roomCode === e.roomCode) {
            room1.meta.favorited = e.favorited;
            break;
          }
        }

        // If the room is a standalone single, set the entire suite to favorited
        if (suite.suiteRooms.length === 1) {
          suite.favorited = e.favorited;
          suite.favoritedInside = e.favorited;
          break;
        }

        // Update whether or not there is a room in this suite that has been favorited
        if (e.favorited) {
          suite.favoritedInside = e.favorited;
        } else {
          var check = false;
          for (var room2 of suite.suiteRooms) {
            if (room2.meta.favorited) {
              check = true;
              break;
            }
          }
          suite.favoritedInside = check;
        }
      }
    }
    this.setState({ suites: mySuites });
  };

  updateYourSort = (e) => {
    const suites = this.sortSuites(e.value, this.props.suites);
    this.setState({
      suites,
    });
  };

  sortSuites = (sortBy, suites) => {
    if (sortBy === "ALPHA") {
      return this.sortBySuiteName(suites, 1);
    } else if (sortBy === "NEGALPHA") {
      return this.sortBySuiteName(suites, -1);
    } else if (sortBy === "FL") {
      return this.sortByFloorLevel(suites, 1);
    } else if (sortBy === "NEGFL") {
      return this.sortByFloorLevel(suites, -1);
    } else if (sortBy === "BR_SZ") {
      return this.sortByBedroomSize(suites, 1);
    } else if (sortBy === "NEGBR_SZ") {
      return this.sortByBedroomSize(suites, -1);
    } else if (sortBy === "NOISE") {
      return this.sortByNoise(suites, 1);
    }
    //NEGNOISE
    return this.sortByNoise(suites, -1);
  };

  sortBySuiteName = (suites, pos) => {
    return suites.sort((a, b) => {
      if (a.suiteRooms[0].roomCode < b.suiteRooms[0].roomCode) return -1 * pos;
      if (a.suiteRooms[0].roomCode > b.suiteRooms[0].roomCode) return 1 * pos;
      return 0;
    });
  };

  sortByFloorLevel = (suites, pos) => {
    // Compare the first letter of the room number
    return suites.sort((a, b) => {
      if (a.suiteRooms[0].roomCode[1] < b.suiteRooms[0].roomCode[1])
        return -1 * pos;
      if (a.suiteRooms[0].roomCode[1] > b.suiteRooms[0].roomCode[1])
        return 1 * pos;
      return 0;
    });
  };

  avgBedroomSize = (suite) => {
    var no = 0,
      sz = 0,
      noRoomsWithEmptyReviews = 0;
    for (const room of suite.suiteRooms) {
      if (room.meta.roomReviews.length === 0) {
        noRoomsWithEmptyReviews++;
      }
      for (const review of room.meta.roomReviews) {
        sz += review.size;
        no++;
      }
    }

    if (noRoomsWithEmptyReviews === suite.suiteRooms.length) {
      return 2.5;
    }
    return sz / no;
  };

  sortByBedroomSize = (suites, pos) => {
    // SortByAvgRoomSize descending
    return suites.sort((a, b) => {
      const aVal = this.avgBedroomSize(a),
        bVal = this.avgBedroomSize(b);
      if (aVal < bVal) return 1 * pos;
      if (aVal > bVal) return -1 * pos;
      return 0;
    });
  };

  avgNoise = (suite) => {
    var no = 0,
      noise = 0,
      noRoomsWithEmptyReviews = 0;
    for (const room of suite.suiteRooms) {
      if (room.meta.roomReviews.length === 0) {
        noRoomsWithEmptyReviews++;
      }
      for (const review of room.meta.roomReviews) {
        noise += review.noise;
        no++;
      }
    }

    if (noRoomsWithEmptyReviews === suite.suiteRooms.length) {
      return 2.5;
    }
    return noise / no;
  };

  sortByNoise = (suites, pos) => {
    return suites.sort((a, b) => {
      const aVal = this.avgNoise(a),
        bVal = this.avgNoise(b);
      if (aVal < bVal) return -1 * pos;
      if (aVal > bVal) return 1 * pos;
      return 0;
    });
  };

  render() {
    return (
      <div className="suitecards-container">
        {this.state.suites.map((suite) => (
          <div
            key={`${suite.buildingName}-${suite.suiteCode}`}
            className="suitecards-inner-container"
          >
            <SuiteCard
              suite={suite}
              handleFavoritedSuite={this.updateSuiteFavorited}
              handleFavoritedRoom={this.updateRoomFavorited}
            />
          </div>
        ))}
      </div>
    );
  }
}
