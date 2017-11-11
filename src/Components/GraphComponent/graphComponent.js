import './graphComponent.scss';
import React from 'react';
import mockData from '../../utils/mockData.json';
import cytoscape from 'cytoscape';
import panzoom from '../../utils/cytoscape-panzoom';



class GraphComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.renderGraph();
    }

    renderGraph () {

      panzoom(cytoscape)
      const cy = cytoscape({

            container: document.getElementById('cy'),

            elements: this.props.mockData.elements,

            style: [ // the stylesheet for the graph
                {
                    selector: 'node',
                    style: {
                        'background-color': '#666',
                        label: 'data(displayName)',
                    },
                },

                {
                    selector: 'edge',
                    style: {
                        width: 3,
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                    },
                },
            ],

            layout: {
                name: 'cose',
                // zoom: this.state.zoom,
                fit: true, // whether to fit to viewport
                padding: 30, // fit padding
                boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
                animate: false, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                animateFilter(node, i) {
                    return true;
                }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
                ready: undefined, // callback on layoutready
                stop: undefined, // callback on layoutstop
                transform(node, position) {
                    return position;
                }, // transform a given node position. Useful for changing flow direction in discrete layouts
            },

        });
        cy.panzoom();
    }

    render() {
        return (
            <div className="graphContainer">
                <div id="cy"/>
            </div>
        );
    }
}

export default GraphComponent;
