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
        this.modifyQuerySelectParams = this.modifyQuerySelectParams.bind(this);
        this.state = {
        	nodes: [],
            selectedRootNode: '',
            querySelectParams: []
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

    modifyQuerySelectParams (param) {
        let querySelectParams = this.state.querySelectParams;
        let index = querySelectParams.indexOf(param);
        index === -1 ? querySelectParams.push(param) : querySelectParams.splice(index, 1);
        this.setState({querySelectParams});
    }

    render() {
        return (
            <div>
                <div>
                    <Header/>
                    <select value={this.state.selectedRootNode} onChange={this.changeRootNode}>
                    <option value=''>Select root node</option>
                    {this.state.nodes.map((node, key) => {
                    	return <option key={key} value={node.id}>{node.displayName}</option>
                    })}
                    </select>
                </div>
                <div className="nonHeader">
                    {this.state.querySelectParams.length > 0 && <ConditionComponent />}
                    <GraphComponent modifyQuerySelectParams = {this.modifyQuerySelectParams} mockData = {mockData} selectedRootNode = {this.state.selectedRootNode} />
                </div>
                <div>
                {this.state.querySelectParams.length > 0 && <QueryComponent querySelectParams={this.state.querySelectParams} />}
                </div>
            </div>
        );
    }
}

export default HomePage;
