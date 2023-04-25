import React, { Component } from "react";
import Nav from "src/components/Nav";
import AboutHeroSection from "src/components/AboutHeroSection/AboutHeroSection";

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
