import './graphComponent.scss';
import React from 'react';
import cytoscape from 'cytoscape';
import panzoom from '../../utils/cytoscape-panzoom';


 var _this;
class GraphComponent extends React.Component {
    constructor(props) {
        super(props);
        _this = this;
        this.removeClickedNode = this.removeClickedNode.bind(this);
        this.onPropSelect = this.onPropSelect.bind(this);
        this.state = {
            clickedNodeId: '',
            clickedNodePath: ''
        };
    }

    componentDidMount() {
        panzoom(cytoscape)
        this.renderGraph(this.props.mockData.elements);
    }

    componentWillReceiveProps(nextProps) {
        this.props.selectedRootNode !== nextProps.selectedRootNode && this.renderGraph(this.props.mockData.elements, nextProps.selectedRootNode);
    }

    removeClickedNode () {
        this.setState({clickedNodeId: '', clickedNodePath: ''});
    }

    renderGraph (dataForDisplay, selectedRootNode) {

      
      const cy = cytoscape({

            container: document.getElementById('cy'),

            elements: dataForDisplay,

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
                name: 'circle',
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
        cy.nodes().on("click", function(event){
            _this.props.selectedRootNode && _this.setState({clickedNodeId: event.target._private.data.id}, () => {
                let clickedNodePath = [];
                Object.keys(cy.elements().dijkstra('#' + _this.props.selectedRootNode).pathTo( cy.$('#' + _this.state.clickedNodeId) )._private.map._obj).map( (node, key) => {
                    if(key === 0 || key % 2 == 0) {
                        clickedNodePath.push(node);
                    }
                })
                _this.setState({clickedNodePath: clickedNodePath});
            });
        });
        cy.panzoom();
        if(selectedRootNode) {
            let treeDataCreated = {elements: []};
            let mappingArr = {};
            var bfs = cy.elements().bfs({
                roots: '#' + selectedRootNode,
                visit: function(v, e, u, i, depth){
                    mappingArr[depth] = mappingArr[depth] ? [ ...mappingArr[depth], v.id()] : [v.id()];
                    treeDataCreated.elements.push({data: {id: v.id(), displayName: v._private.data.displayName, level: depth}});
                },
                directed: false
            });
            let newTreeData = JSON.parse(JSON.stringify(treeDataCreated));
            let allEdges = [];
            treeDataCreated.elements.map(node => {
                if(node.data.level !== 0) {
                    var edgeCreated = false;
                    mappingArr[node.data.level -1].map((s) => {
                        this.props.mockData.elements.map((mock) => {
                            if(mock.data.id === String(node.data.id) + String(s) || mock.data.id === String(s) + String(node.data.id)) {
                                allEdges.push(mock.data.id);
                                !edgeCreated && newTreeData.elements.push(mock);  
                                edgeCreated  = true;
                            }
                        });
                    })
                }
            });
            this.renderGraph(newTreeData.elements);
        }
        


        //this.props.selectedRootNode && var path = bfs.path; // path to found node
        //this.props.selectedRootNode && var found = bfs.found; // found node

        // select the path
        //this.props.selectedRootNode && bfs.path.select();
    }

    ff () {
        let returnValue;
        this.props.mockData.elements.map((element) => {
            if(element.data.id === this.state.clickedNodeId) {
                returnValue = element;
            }
        });
        return returnValue;
    }

    onPropSelect(event) {
        let str = '';
        this.state.clickedNodePath.map((elem, key) => {
            str = key !== 0 ? str + '.' + elem : elem;
        })
        this.props.modifyQuerySelectParams(str + '.' + event.target.name);
    }

    render() {
        let node = this.ff();
        return (
            <div className="graphContainer">
                <div id="cy"/>
                {this.state.clickedNodeId && this.props.selectedRootNode && <div className='propertySelector'>
                    <div className='nodeHeading'>
                        <div>{node.data.displayName}</div>
                        <div className='nodeActions'>
                            <div className='reset'></div>
                            <div className='close' onClick={this.removeClickedNode}></div>
                        </div>
                    </div>
                    <div>
                        {Object.keys(node.data).map((key, k) => {
                            return (
                                <div className='nodeProperty' key={k}>
                                    <div><input name={key} defaultChecked={this.state.checked} type='checkbox' onChange={this.onPropSelect} />
                                        <div className='nodeKey'>{key}</div>
                                    </div>
                                    <div>{node.data[key]}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>}
            </div>
        );
    }
}

export default GraphComponent;
