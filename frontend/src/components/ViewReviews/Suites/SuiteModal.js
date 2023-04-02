import "./SuiteModal.css";
import React, { Component } from "react";
// import { CSSTransition } from 'react-transition-group'
import BedroomCard from "./BedroomCard";
import { numberToAcronym } from "../../../utils/colleges";
import { roomColorCodes } from "../../../utils/colleges";
import noise from "../../../static/noise.svg";
import size from "../../../static/size.svg";

export default class SuiteModal extends Component {
  handleFavorited = (e) => {
    this.props.handleFavorited(e);
  };

  activateReview = (e) => {
    this.props.handleActivateReview(e);
  };

  render() {
    return (
      <div className="suite-modal">
        <div className="suite-modal-header">
          <h4 className="suite-modal-title">{this.props.title}</h4>
          <div className="suite-badge-container">
            <p
              className="suite-modal-header-badge"
              pill
              style={{
                background:
                  roomColorCodes[(this.props.suiteStats.noBeds - 1) % 8].color,
                color:
                  roomColorCodes[(this.props.suiteStats.noBeds - 1) % 8].tcolor,
                marginBottom: "0",
              }}
            >
              {numberToAcronym(this.props.suiteStats.noBeds)}
            </p>

            <div className="modal-icon-badge-container">
              <p className="modal-badge-gray" style={{ marginBottom: "0px" }}>
                {" "}
                <img className="badge-icon" src={noise} alt="noise" />{" "}
                {(Math.round(this.props.suiteStats.noise * 10) / 10).toFixed(1)}{" "}
              </p>
              <p className="modal-badge-gray" style={{ marginBottom: "0px" }}>
                {" "}
                <img className="badge-icon" src={size} alt="size" />{" "}
                {(Math.round(this.props.suiteStats.size * 10) / 10).toFixed(1)}{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="suite-modal-card-container">
          {this.props.rooms.map((room) => (
            <BedroomCard
              key={room.roomCode}
              room={room}
              handleFavorited={this.handleFavorited}
              handleActivateReview={this.activateReview}
            />
          ))}
        </div>
      </div>
    );
  }
}
