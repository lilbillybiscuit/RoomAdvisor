import "src/components/ViewReviews/Suites/BedroomCard/BedroomCard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import ImageRenderer from "src/components/ImageRenderer/ImageRenderer";
import thumbnail from "src/images/no_reviews.jpeg";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import { numberToAcronym } from "src/services/data/colleges";
import { roomColorCodes } from "src/services/data/colleges";
import noise from "src/images/noise.svg";
import size from "src/images/size.svg";
import review from "src/images/review-icon.svg";

export default class BedroomCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favorited: this.props.room.meta.favorited,
      previewPicture: this.selectPreviewPicture(),
      roomStats: this.computeRoomstats(this.props.room),
    };
  }

  computeRoomNoiseSize = (reviews) => {
    if (reviews.length === 0) {
      //If no reviews have been give, return median number
      return { noise: -1, size: -1 };
    }

    var noise = 0,
      size = 0;
    for (const review of reviews) {
      noise += review.noise;
      size += review.size;
    }

    noise = noise / reviews.length;
    size = size / reviews.length;
    return { noise: noise, size: size };
  };

  computeRoomstats = (room) => {
    const noiseAndSize = this.computeRoomNoiseSize(room.meta.roomReviews);
    if (noiseAndSize.noise === -1) {
      return { noise: 2.5, size: 2.5, previewText: "" };
    }

    var recommendations = [];
    for (const review of room.meta.roomReviews) {
      recommendations.push(review.rec);
    }

    // Pick random recommendation
    var previewText =
      recommendations[Math.floor(Math.random() * recommendations.length)];

    // Preview text can only be 39 characters long
    if (previewText.length > 39) {
      previewText = previewText.slice(0, 39);
    }

    // Add quotes
    previewText = '"' + previewText + '"';

    return {
      noise: noiseAndSize.noise,
      size: noiseAndSize.size,
      previewText: previewText,
    };
  };

  selectPreviewPicture = () => {
    // Select random picture
    return this.props.room.meta.pictures[
      Math.floor(Math.random() * this.props.room.meta.pictures.length)
    ];
  };

  // Look out of change of state of bedroom props
  static getDerivedStateFromProps(props, state) {
    if (props.room.meta.favorited !== state.favorited) {
      //Change in props
      return {
        favorited: props.room.meta.favorited,
      };
    }
    return null; // No change to state
  }

  toggleFavorited = () => {
    const favorited = !this.state.favorited;
    this.props.handleFavorited({
      roomCode: this.props.room.roomCode,
      favorited: favorited,
    });
    this.setState({ favorited });
  };

  activateReview = (e) => {
    // Don't activate review if you are trying to like a room
    if (e.target.className === "favorite-bedroom") return;
    this.props.handleActivateReview({ roomCode: this.props.room.roomCode });
  };

  render() {
    return (
      <div className="bedroom-card" onClick={this.activateReview}>
        <div className="favorite-bedroom" onClick={this.toggleFavorited}>
          {!this.state.favorited ? (
            <FaRegBookmark style={{ color: "#fff", fontSize: "25px" }} />
          ) : (
            <FaBookmark style={{ color: "#fff", fontSize: "25px" }} />
          )}
        </div>

        <ImageRenderer
          thumb={thumbnail}
          url={
            !this.state.previewPicture ? thumbnail : this.state.previewPicture
          }
          alt="room-view"
        />

        <div className="bedroom-title-container">
          <h5 className="bedroom-card-title">{this.props.room.roomCode}</h5>
          <p
            className="bedroom-badge"
            style={{
              background:
                roomColorCodes[(this.props.room.meta.noBeds - 1) % 8].color,
              color:
                roomColorCodes[(this.props.room.meta.noBeds - 1) % 8].tcolor,
              marginBottom: "0",
            }}
          >
            {numberToAcronym(this.props.room.meta.noBeds)}
          </p>
        </div>

        <div className="modal-quote-badge-container">
          <p className="bedroom-card-review-quotes">
            <img className="review-icon" src={review} alt="review-icon" />
            <div> {this.state.roomStats.previewText} </div>
          </p>
          <p className="bedroom-badge-gray" style={{ marginBottom: "0px" }}>
            {" "}
            <img className="badge-icon" src={noise} alt="noise" />{" "}
            {(Math.round(this.state.roomStats.noise * 10) / 10).toFixed(1)}{" "}
          </p>
          <p className="bedroom-badge-gray" style={{ marginBottom: "0px" }}>
            {" "}
            <img className="badge-icon" src={size} alt="size" />{" "}
            {(Math.round(this.state.roomStats.size * 10) / 10).toFixed(1)}{" "}
          </p>
        </div>
      </div>
    );
  }
}
