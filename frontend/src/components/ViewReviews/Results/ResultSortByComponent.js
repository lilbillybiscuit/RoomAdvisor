import "./ResultSortByComponent.css";
import React, { Component } from "react";
import Select from "react-select";
import { sortOptions } from "../../../utils/colleges";

export default class SortByComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currSelected: this.props.sortBy,
    };
  }

  handleSortByChange = (e) => {
    const currSelected = e;
    this.setState({
      currSelected,
    });
    this.props.handleChange(e);
  };

  render() {
    return (
      <Select
        className="basic-single"
        classNamePrefix="select"
        value={this.state.currSelected}
        name="color"
        options={sortOptions}
        onChange={this.handleSortByChange}
        isSearchable={false}
      />
    );
  }
}
