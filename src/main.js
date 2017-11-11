import React from 'react';
import ReactDOM from 'react-dom';
import './main.scss';
import Graph from './utils/Graph';
import Homepage from './Components/HomePage/homePage';
import * as OfflinePluginRuntime from 'offline-plugin/runtime';

OfflinePluginRuntime.install();

// window.graph = new Graph();
// graph.addVertex('A');
// graph.addVertex('B');
// graph.addVertex('C');
// graph.addVertex('D');
// graph.addVertex('E');
// graph.addVertex('F');
// graph.addVertex('G');

// graph.addEdge('A', 'B');
// graph.addEdge('A', 'C');
// graph.addEdge('A', 'D');
// graph.addEdge('B', 'C');
// graph.addEdge('D', 'C');
// graph.addEdge('D', 'E');
// graph.addEdge('E', 'F');
// graph.addEdge('E', 'G');
// graph.traverseBFS('F', function(vertex) { console.log(vertex); });


ReactDOM.render(<Homepage />, document.getElementById('app'));