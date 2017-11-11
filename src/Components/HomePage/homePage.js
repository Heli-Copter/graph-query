import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './homePage.scss';
import Header from '../Header/header';
import GraphComponent from '../GraphComponent/graphComponent';


class HomePage extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div>
      	<Header />
      	<GraphComponent />
      </div>
    );
  }
}

export default HomePage;