import "./NavSearchBar.css";
import React, { Component } from "react";

export default class NavSearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currSearch: this.props.currSearch,
    };
  }

  onFormSubmit = (e) => {
    e.preventDefault();
    this.props.handleCloseHamburger();
  };

  //Parent nav prop asks you to update state here
  updateYourState = (e) => {
    const currSearch = e;
    this.setState({
      currSearch,
    });
  };

  onInputchange = (e) => {
    const currSearch = e.target.value;
    //search for suites whenever you type something
    this.props.handleChange(currSearch);
    this.setState({
      currSearch,
    });
  };

  onEnter = (e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
  };

  render() {
    return (
      <form onSubmit={this.onFormSubmit}>
        <input
          className="input"
          type="text"
          id="header-search"
          placeholder="Search for a room"
          name="searchItem"
          value={this.state.currSearch}
          onChange={this.onInputchange}
          onKeyUp={this.onEnter}
        />
      </form>
    );
  }
}
