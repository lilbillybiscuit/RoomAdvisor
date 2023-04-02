import "./GuidelinesList.css";
import React from "react";

class GuidelinesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        "I will treat others online as you would treat them in real life",
        "I will be tolerant towards other’s viewpoints",
        "I will respectfully disagree when opinions do not align",
        "I will respect the privacy and personal information of other alumni",
        "I will ommunicate with courtesy and respect",
        "I will not comment on my suite/hall mates",
        "I will not name anyone. I will not post pictures of others without consent",
        "I will not post prejudiced comments or profanity",
        "I will not bully or make inflammatory remarks to other community members",
        "I will not use this platform to engage in cyberbullying, harassment, hate speech, or any form of bigotry",
        "I will review the room honestly based on my own experience of living in the room,",
      ],
    };
  }

  // creates scrollable container for displaying reviews within the modal
  render() {
    return (
      <div>
        <div
          className="scroll-container"
          style={{
            overflow: "scroll",
            backgroundColor: "#f5f5f5",
          }}
        >
          {this.state.items.map((item) => (
            <h5 className="bullet-item"> {item} </h5>
          ))}
        </div>
      </div>
    );
  }
}

export default GuidelinesList;
