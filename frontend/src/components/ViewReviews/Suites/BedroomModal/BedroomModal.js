import React, { Component } from "react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa";
import room from "src/images/no_reviews.jpeg";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import BarChartComponent from "src/components/ViewReviews/Suites/BedroomModalBarChart";
import { numberToAcronym } from "src/services/data/colleges";
import { IoIosArrowBack } from "react-icons/io";
import { roomColorCodes } from "src/services/data/colleges";
import noise from "src/images/noise.svg";
import size from "src/images/size.svg";
import { Tabs } from "@mantine/core";
import { numberToClassYear } from "src/services/data/colleges";
import "src/components/ViewReviews/Suites/BedroomModal/BedroomModal.css";

export default class BedroomModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      favorited: this.props.room.meta.favorited,
      roomStats: this.computeRoomstats(this.props.room),
    };
  }

  computeRoomNoiseSize = (reviews, noiseReadings, sizeReadings) => {
    if (reviews.length === 0) {
      //If no reviews have been give, return median number
      return {
        noise: -1,
        size: -1,
        noiseReadings: noiseReadings,
        sizeReadings: sizeReadings,
      };
    }

    var noise = 0,
      size = 0;
    for (const review of reviews) {
      noiseReadings[review.noise]++;
      sizeReadings[review.size]++;
      noise += review.noise;
      size += review.size;
    }

    noise = noise / reviews.length;
    size = size / reviews.length;
    return {
      noise: noise,
      size: size,
      noiseReadings: noiseReadings,
      sizeReadings: sizeReadings,
    };
  };

  computeRoomstats = (room) => {
    var noiseReadings = [0, 0, 0, 0, 0];
    var sizeReadings = [0, 0, 0, 0, 0];
    const noiseAndSize = this.computeRoomNoiseSize(
      room.meta.roomReviews,
      noiseReadings,
      sizeReadings
    );

    var noiseData = [];
    noiseData.push({
      argument: "Much quieter",
      value: noiseAndSize.noiseReadings[0],
    });
    noiseData.push({
      argument: "Quieter",
      value: noiseAndSize.noiseReadings[1],
    });
    noiseData.push({ argument: "Same", value: noiseAndSize.noiseReadings[2] });
    noiseData.push({
      argument: "Louder",
      value: noiseAndSize.noiseReadings[3],
    });
    noiseData.push({
      argument: "Much louder",
      value: noiseAndSize.noiseReadings[4],
    });

    var sizeData = [];
    sizeData.push({
      argument: "Much smaller",
      value: noiseAndSize.sizeReadings[0],
    });
    sizeData.push({ argument: "Smaller", value: noiseAndSize.sizeReadings[1] });
    sizeData.push({ argument: "Same", value: noiseAndSize.sizeReadings[2] });
    sizeData.push({ argument: "Larger", value: noiseAndSize.sizeReadings[3] });
    sizeData.push({
      argument: "Much larger",
      value: noiseAndSize.sizeReadings[4],
    });

    if (noiseAndSize.noise > -1) {
      return {
        noise: noiseAndSize.noise,
        size: noiseAndSize.size,
        noiseReadings: noiseData,
        sizeReadings: sizeData,
      };
    }
    return {
      noise: 2.5,
      size: 2.5,
      noiseReadings: noiseData,
      sizeReadings: sizeData,
    };
  };

  goBackToSuiteView = () => {
    this.props.handleActivateViewSuite();
  };

  toggleFavoritedRoom = () => {
    const favorited = !this.state.favorited;
    this.props.handleFavorited({
      roomCode: this.props.room.roomCode,
      favorited: favorited,
    });
    this.setState({ favorited });
  };

  render() {
    return (
      <div className="bedroom-modal">
        <div className="bedroom-modal-header">
          <div
            className={
              !this.props.isSingle
                ? "bedroom-modal-backarrow"
                : "bedroom-modal-backarrow zero-opacity"
            }
            onClick={this.goBackToSuiteView}
          >
            <IoIosArrowBack style={{ color: "#0053c5", fontSize: "30px" }} />
          </div>

          <h4 className="bedroom-modal-title">{this.props.title}</h4>
          <div
            className={
              !this.props.isSingle
                ? "bedroom-badge-container"
                : "bedroom-badge-container is-single"
            }
          >
            <p
              className="suite-modal-header-badge"
              pill
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

            <div className="modal-icon-badge-container">
              <p className="modal-badge-gray" style={{ marginBottom: "0px" }}>
                {" "}
                <img className="badge-icon" src={noise} alt="noise" />{" "}
                {(Math.round(this.state.roomStats.noise * 10) / 10).toFixed(1)}{" "}
              </p>
              <p className="modal-badge-gray" style={{ marginBottom: "0px" }}>
                {" "}
                <img className="badge-icon" src={size} alt="size" />{" "}
                {(Math.round(this.state.roomStats.size * 10) / 10).toFixed(1)}{" "}
              </p>
            </div>
          </div>

          <div
            className={
              !this.props.isSingle
                ? "favorite-room-modal"
                : "favorite-room-modal fav-room-standalone"
            }
            onClick={this.toggleFavoritedRoom}
          >
            {!this.state.favorited ? (
              <FaRegBookmark style={{ color: "#0053c5", fontSize: "30px" }} />
            ) : (
              <FaBookmark style={{ color: "#0053c5", fontSize: "30px" }} />
            )}
          </div>
        </div>

        <div className="bedroom-modal-body">
          <div className="col-md-5">
            {this.props.room.meta.pictures.length === 0 ? (
              <Carousel showArrows={true} showThumbs={false}>
                <div>
                  <img className="card-photo" src={room} alt="room-view" />
                </div>
              </Carousel>
            ) : (
              <>
                <Carousel showArrows={true} showThumbs={false}>
                  {this.props.room.meta.pictures.map((pic) => (
                    <div id={pic.name}>
                      <img className="card-photo" src={pic} alt="room-view" />
                    </div>
                  ))}
                </Carousel>
              </>
            )}

            {this.props.room.meta.roomReviews.length > 0 ? (
              <div className="barchart-container">
                <div className="barchart">
                  <div>Noise</div>
                  <BarChartComponent
                    data={this.state.roomStats.noiseReadings}
                  />
                </div>
                <div className="barchart">
                  <div>Size</div>
                  <BarChartComponent data={this.state.roomStats.sizeReadings} />
                </div>
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="col-md-7 bedroom-modal-body-right">
            <h2 className="bedroom-modal-subtitle">Reviews</h2>
            <Tabs>
              <Tabs.Tab label="Strengths/Weaknesses">
                <div className="review-container">
                  {this.props.room.meta.roomReviews.length === 0 ? (
                    <div className="review-text"> No reviews yet...</div>
                  ) : (
                    <>
                      {this.props.room.meta.roomReviews.map((review) => (
                        <div className="review">
                          <div className="review-badge-container">
                            <p
                              className="modal-badge-gray review-badge"
                              style={{ marginBottom: "0px" }}
                            >
                              {numberToClassYear(review.reviewerClassYear)}
                            </p>
                            <p
                              className="modal-badge-gray review-badge"
                              style={{ marginBottom: "0px" }}
                            >
                              {review.reviewYear}
                            </p>
                          </div>
                          <div>{review.sw}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Tabs.Tab>
              <Tabs.Tab label="Recommend?">
                <div className="review-container">
                  {this.props.room.meta.roomReviews.length === 0 ? (
                    <div className="review-text"> No reviews yet...</div>
                  ) : (
                    <>
                      {this.props.room.meta.roomReviews.map((review) => (
                        <div className="review">
                          <div className="review-badge-container">
                            <p
                              className="modal-badge-gray review-badge"
                              style={{ marginBottom: "0px" }}
                            >
                              {numberToClassYear(review.reviewerClassYear)}
                            </p>
                            <p
                              className="modal-badge-gray review-badge"
                              style={{ marginBottom: "0px" }}
                            >
                              {review.reviewYear}
                            </p>
                          </div>
                          <div>{review.rec}</div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </Tabs.Tab>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
