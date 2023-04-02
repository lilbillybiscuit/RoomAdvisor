import React from "react";
import "./ReviewItem.css";
import Badge from "react-bootstrap/Badge";

class ReviewItem extends React.Component {
  render() {
    const { item } = this.props;
    return (
      <div className="review-container" style={{ padding: "6px" }} id={item}>
        {/* Title description showing the class year and review date of the review */}
        <h4 className="subtext">
          {" "}
          Lived as a{" "}
          <Badge className="small-badge" bg="secondary">
            {" "}
            Senior{" "}
          </Badge>{" "}
          in{" "}
          <Badge className="small-badge" bg="info">
            {" "}
            2019{" "}
          </Badge>{" "}
        </h4>

        {/* sample review text */}
        <p>
          {" "}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum. {item}{" "}
        </p>
      </div>
    );
  }
}

export default ReviewItem;
