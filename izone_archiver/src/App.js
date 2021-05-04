import React from "react";
import "./App.css";
import "./index.css";
import VideoPage from "./components/VideoPage";
import VideoList from "./components/VideoList";
import { Nav, Navbar } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import logo from "../public/logo.svg";

//! https://betterprogramming.pub/how-to-hide-your-api-keys-c2b952bc07e6
//! https://stackoverflow.com/questions/57358605/multiple-filters-in-react
//TODO Get load more option working? or not

export default function App() {
  return (
    // <Router>
    <div className="app">
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="/">
          <img src={logo} width="46" height="44" />
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <Nav.Link href="/donate" style={{ color: "white" }}>
            Donate
          </Nav.Link>
          <Nav.Link href="/contact" style={{ color: "white" }}>
            Contact
          </Nav.Link>
        </Navbar.Collapse>
      </Navbar>
      {/* <Switch>
          <Route
            exact
            path="/"
            render={(props) => {
              return <VideoList {...props} />;
            }}
          />
          <Route
            path="/video/:id"
            render={(props) => {
              return <VideoPage {...props} />;
            }}
          />
        </Switch> */}
    </div>
    // </Router>
  );
}

// https://www.npmjs.com/package/react-player
//https://qiita.com/mehdi/items/95a250cd36fa11fd6856
// https://www.channelape.com/uncategorized/host-images-amazon-s3-cheap-5-minutes/
// https://www.youtube.com/watch?v=Wn0TtkoRx58
