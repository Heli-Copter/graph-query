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
        this.state = {
        	nodes: []
        };
    }

    componentDidMount() {
    	let nodes = [];
    	mockData.elements.map(elem => {
    		!elem.data.source && !elem.data.target && nodes.push(elem.data);
    	})
    	this.setState({nodes});
    }

    render() {
        return (
            <div>
                <div>
                    <Header/>
                    <select>
                    <option value='' >Select root node</option>
                    {this.state.nodes.map((node, key) => {
                    	return <option key={key} value={node.id}>{node.displayName}</option>
                    })}
                    </select>
                </div>
                <div className="nonHeader">
                    <ConditionComponent />
                    <GraphComponent mockData = {mockData}/>
                </div>
                <div>
                    <QueryComponent/>
                </div>
            </div>
        );
    }
}

export default HomePage;
