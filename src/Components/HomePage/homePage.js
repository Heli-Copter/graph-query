import React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import './homePage.scss';
import Header from '../Header/header';
import GraphComponent from '../GraphComponent/graphComponent';
import ConditionComponent from '../ConditionComponent/conditionComponent';


class HomePage extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div>
        <div>
          <Header />
          <select />
        </div>
        <div className="nonHeader">
          <ConditionComponent />
          <GraphComponent />
        </div>
        <div>
          <QueryComponent />
        </div>
      </div>
    );
  }
}

export default HomePage;
