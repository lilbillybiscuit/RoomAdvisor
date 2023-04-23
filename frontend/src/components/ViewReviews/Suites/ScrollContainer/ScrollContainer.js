import React from "react";
import ReviewItem from "src/components/ViewReviews/Suites/ReviewItem/ReviewItem";

class ScrollContainer extends React.Component {
  state = {
    items: [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    ],
  };

  handleScroll = (event) => {
    console.log(event);
  };

  // creates scrollable container for displaying reviews within the modal
  render() {
    return (
      <div>
        <div style={{ height: `300px`, overflow: "scroll" }}>
          {this.state.items.map((item) => (
            <ReviewItem
              ref={(inst) => (this[`ref_${item}`] = inst)}
              item={item}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default ScrollContainer;
