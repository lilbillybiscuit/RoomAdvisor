import "src/components/ViewReviews/Nav/NavDropdownComponent/NavDropdownComponent.css";
import React, { Component } from "react";
import Select from "react-select";
import { buildings } from "src/services/data/colleges";

const styles = {
  control: (base) => ({
    ...base,
    fontSize: "1rem",
  }),
  menu: (base) => ({
    ...base,
    fontSize: "1rem",
  }),
};

export default class NavDropdownComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currSelected: buildings[this.findCollegeIndex()],
    };
  }

  findCollegeIndex = () => {
    var idx = 0;
    for (const building of buildings) {
      if (this.props.currCollege.value === building.value) return idx;
      idx++;
    }
  };

  // Send new value to the parent nav prop
  handleChange = (e) => {
    this.props.handleChange(e);
  };

  //Parent nav prop asks you to update state here
  updateYourState = (e) => {
    const currSelected = e;
    this.setState({
      currSelected,
    });
  };

  render() {
    return (
      <Select
        className="basic-single college-select"
        classNamePrefix="select"
        value={this.state.currSelected}
        name="color"
        options={buildings}
        onChange={this.handleChange}
        styles={styles}
        isSearchable={false}
      />
    );
  }
}
