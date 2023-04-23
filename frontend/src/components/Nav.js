import "./Nav.css";
import React, { Component, createRef } from "react";
import { NavLink } from "react-router-dom";
import logo from "src/images/logo.png";
import NavDropdownComponent from "src/components/ViewReviews/Nav/NavDropdownComponent/NavDropdownComponent";
import NavDropdownMultiselect from "src/components/ViewReviews/Nav/NavDropdownMultiselect/NavDropdownMultiselect";
import NavSearchBar from "src/components/ViewReviews/Nav/NavSearchBar/NavSearchBar";
import { Bookmark, BoxArrowRight } from "react-bootstrap-icons";

export default class Nav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isActiveHamburger: false,
    };
    this.container = createRef();
  }

  // Ensure that when the user clicks outside the navbar, you close it
  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    if (
      this.container.current &&
      !this.container.current.contains(event.target)
    ) {
      this.setState({
        isActiveHamburger: false,
      });
    }
  };

  toggleActiveHamburger = () => {
    const isActiveHamburger = !this.state.isActiveHamburger;
    this.setState({
      isActiveHamburger,
    });
  };

  handleBuildingDropdownChange = (e) => {
    //Update states for both building dropdowns (for large and small screens)
    this.buildingDropdown1.updateYourState(e);
    this.searchChange1.updateYourState("");
    // Send the change to the parent page so it also updates
    this.props.handleBuildingChange(e);
  };

  handleRoomSizeChange = (e) => {
    //Update states for both building dropdowns (for large and small screens)
    this.roomSize1.updateYourState(e);
    this.searchChange1.updateYourState("");
    // Send the change to the parent page so it also updates
    this.props.handleRoomSizeChange(e);
  };

  handleSearchChange = (e) => {
    this.searchChange1.updateYourState(e);
    // Send the change to the parent page so it also updates
    this.props.handleSearchChange(e);
  };

  render() {
    return (
      <>
      <div className="container" ref={this.container}>
        <div className="navbar-header">
          <header>
            <nav>
              <div className="navbar-container">
                <NavLink to="/">
                  <img
                    src={logo}
                    alt="room-advisor-logo"
                    style={{
                      position: "relative",
                      height: "50px",
                      width: "110px",
                    }}
                  />
                </NavLink>

                <div
                  className={
                    this.state.isActiveHamburger ? "menu is-active" : "menu"
                  }
                >
                  {this.props.mode === "VERBOSE" ? (
                    <div className="filters-container">
                      <div className="filter-item">
                        <NavDropdownComponent
                          ref={(ip) => {
                            this.buildingDropdown1 = ip;
                          }}
                          currCollege={this.props.currState.building}
                          handleChange={this.handleBuildingDropdownChange}
                        />
                      </div>
                      <div className="filter-item">
                        <NavDropdownMultiselect
                          ref={(ip) => {
                            this.roomSize1 = ip;
                          }}
                          currSelection={this.props.currState.roomSizes}
                          handleChange={this.handleRoomSizeChange}
                        />
                      </div>
                      <div className="filter-item">
                        <NavSearchBar
                          ref={(ip) => {
                            this.searchChange1 = ip;
                          }}
                          currSearch={this.props.currState.searchItem}
                          handleChange={this.handleSearchChange}
                          handleCloseHamburger={this.toggleActiveHamburger}
                        />
                      </div>
                      <div className="nav-no-suites-found">
                        {this.props.currState.noRoomsFound} suites found
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="navbar-link-container">
                    <NavLink to="/about" className="navbar-link">
                      About
                    </NavLink>
                    {this.props.user !== undefined ? (
                      <NavLink to="/favorites" className="navbar-link">
                        <div className="navbar-link-icon">
                          <Bookmark
                            className="navbar-link-icon"
                            style={{ height: "20px" }}
                          />
                        </div>
                        Favorites
                      </NavLink>
                    ) : (
                      ""
                    )}
                    {this.props.user !== undefined ? (
                      <NavLink to="/logout" className="navbar-link">
                        <div className="navbar-link-icon">
                          <BoxArrowRight />
                        </div>
                        Logout
                      </NavLink>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <button
                  class={
                    this.state.isActiveHamburger
                      ? "hamburger is-active"
                      : "hamburger"
                  }
                  onClick={this.toggleActiveHamburger}
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </nav>
          </header>
        </div>
      </div>
      </>
    );
  }
}
