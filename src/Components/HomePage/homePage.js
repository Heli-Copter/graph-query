import React from 'react';
import './homePage.scss';
import Header from '../Header/header';
import GraphComponent from '../GraphComponent/graphComponent';
import ConditionComponent from '../ConditionComponent/conditionComponent';
import QueryComponent from '../QueryComponent/queryComponent';
import mockData from '../../utils/mockData.json';


class HomePage extends React.Component {
    constructor() {
        super();
        this.changeRootNode = this.changeRootNode.bind(this);
        this.state = {
        	nodes: [],
            showConditionComponent: false,
            showQueryComponent: false,
            selectedRootNode: ''
        };
    }

    componentDidMount() {
    	let nodes = [];
    	mockData.elements.map(elem => {
    		!elem.data.source && !elem.data.target && nodes.push(elem.data);
    	})
    	this.setState({nodes});
    }
    changeRootNode (event) {
        this.setState({selectedRootNode: event.target.value});
    }

    render() {
        return (
            <div>
                <div>
                    <Header/>
                    <select>
                    <option value='' onChange={this.changeRootNode}>Select root node</option>
                    {this.state.nodes.map((node, key) => {
                    	return <option key={key} value={node.id}>{node.displayName}</option>
                    })}
                    </select>
                </div>
                <div className="nonHeader">
                    {this.state.showConditionComponent && <ConditionComponent />}
                    <GraphComponent mockData = {mockData}/>
                </div>
                <div>
                {this.state.showQueryComponent && <QueryComponent />}
                </div>
            </div>
        );
    }
}

export default HomePage;
