import "./Results.css";
import React, { Component } from "react";
import SortByComponent from "./ResultSortByComponent";

export default class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noRooms: this.props.noRooms,
      currSelectedSortBy: this.props.sortBy,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.setState({ noRooms: this.props.noRooms });
    }
  }

  handleSortByChange = (e) => {
    this.props.handleChange(e);
  };

  render() {
    return (
      <div className="results-container">
        {/* <h1 className="suites-found">{this.state.noRooms} suites found </h1> */}
        <h1 className="suites-found-mobile">
          {this.state.noRooms} suites in {this.props.college} found{" "}
        </h1>
        {/* Sort by tool displayed on the right corner of the container  */}
        <div className="push-right">
          <SortByComponent
            sortBy={this.state.currSelectedSortBy}
            handleChange={this.handleSortByChange}
          />
        </div>
      </div>
    );
  }
}
