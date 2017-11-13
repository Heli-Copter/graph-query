import React from 'react';
import ReactDOM from 'react-dom';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';
import './main.scss';
import Homepage from './Components/HomePage/homePage';

OfflinePluginRuntime.install();
ReactDOM.render(<Homepage/>, document.getElementById('app'));
