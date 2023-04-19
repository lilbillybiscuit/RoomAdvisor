import React, { Component } from "react";
import Nav from "../components/Nav";
import AboutHeroSection from "../components/AboutPage/AboutHeroSection";

export default class AboutPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: this.props.user,
    };
  }

  render() {
    return (
      <div>
        <Nav user={this.state.user} />
        <AboutHeroSection />
      </div>
    );
  }
}

// function testSuite() {
//   fetch("http://localhost:4000/api/suites", {
//     credentials: "include"
//   }).then(res => {
//     if(res.status === 200) {
//       console.log(res.json())
//       return res.json()
//     }
//   })
// }

// testSuite();
