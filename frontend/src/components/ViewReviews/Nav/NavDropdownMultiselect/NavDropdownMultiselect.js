import "src/components/ViewReviews/Nav/NavDropdownMultiselect/NavDropdownMultiselect.css";
import React, { Component } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { roomsizes } from "src/services/data/colleges";

// a dropdown menu component with the ability to choose multiple options for filtering for room sizes
export default class NavDropdownMultiselect extends Component {
  constructor(props) {
    super(props);
    this.animated = makeAnimated();
    this.state = {
      currSelected: this.initializeRoomSizes(),
    };
  }

  initializeRoomSizes = () => {
    var retItems = [];
    for (const room of this.props.currSelection) {
      retItems.push(roomsizes[this.findRoomSizeIndex(room.value)]);
    }
    return retItems;
  };

  findRoomSizeIndex = (target) => {
    var idx = 0;
    for (const room of roomsizes) {
      if (target === room.value) return idx;
      idx++;
    }
  };

  // Send new value to the parent nav prop
  handleRoomSizeChange = (e) => {
    //Max of 4 elements for search
    if (e.length > 4) {
      alert("You can only search for 4 items at a time");
    } else {
      this.props.handleChange(e);
    }
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
      <div className="multi-select-container">
        <Select
          className="basic-multi-select"
          closeMenuOnSelect={false}
          components={this.animated}
          value={this.state.currSelected}
          isMulti
          options={roomsizes}
          onChange={this.handleRoomSizeChange}
        />
      </div>
    );
  }
}
