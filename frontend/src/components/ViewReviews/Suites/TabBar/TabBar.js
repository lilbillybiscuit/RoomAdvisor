import "src/components/ViewReviews/Suites/TabBar/TabBar.css";
import React, { useState } from "react";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ScrollContainer from "src/components/ViewReviews/Suites/ScrollContainer/ScrollContainer";
// import Sonnet from 'react-bootstrap/Tabs'

// TabBar for toggleing views between the reviews to the two different prompts (Recommend? and Strenths/Weaknesses)

function TabBar() {
  const [key, setKey] = useState("Recommend?");

  return (
    <Tabs
      id="controlled-tab-example"
      activeKey={key}
      onSelect={(k) => setKey(k)}
      className="mb-2"
    >
      <Tab eventKey="Recommend?" title="Recommend?">
        <ScrollContainer />
      </Tab>

      <Tab eventKey="Strengths/Weaknesses" title="Strengths/Weaknesses">
        <ScrollContainer />
      </Tab>
    </Tabs>
  );
}

export default TabBar;
