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
        this.modifyQueryWhereParams = this.modifyQueryWhereParams.bind(this);
        this.operatorsMap = {
            is: '==',
            isNot: '!=',
            lessThan: '<',
            greaterThan: '>',
        };
        this.state = {
            nodes: [],
            selectedRootNode: '',
            querySelectParams: [],
            whereString: '',
        };
    }

    componentDidMount() {
        const nodes = [];
        mockData.elements.map((elem) => {
            !elem.data.source && !elem.data.target && nodes.push(elem.data);
        });
        this.setState({nodes});
    }

    changeRootNode(event) {
        this.setState({selectedRootNode: event.target.value, querySelectParams: []});
    }

    modifyQuerySelectParams(param) {
        const querySelectParams = this.state.querySelectParams;
        const index = querySelectParams.indexOf(param);
        index === -1 ? querySelectParams.push(param) : querySelectParams.splice(index, 1);
        this.setState({querySelectParams});
    }

    modifyQueryWhereParams(param) {
        const obj = {};
        const xxx = [];
        Object.keys(param).map((key) => {
            if (param[key].prop !== '' && param[key].op !== '' && param[key].val !== '') {
                obj[key] = `${param[key].prop} ${this.operatorsMap[param[key].op]} ${param[key].val}`;
            }
        });
        Object.keys(obj).map((key) => {
            const level = (key.match(/\./g) || []).length;
            xxx[level] = xxx[level] ? `${xxx[level]} AND ${obj[key]}` : obj[key];
        });

        let str = '';
        let firstTime = true;
        xxx.map((x) => {
            if (x) {
                str = firstTime ? x : `${str} AND ( ${x} ) `;
                firstTime = false;
            }
        });
        str && this.setState({whereString: `WHERE ${str}`});
    }

    render() {
        return (
            <div>
                <div>
                    <Header/>
                    <select value={this.state.selectedRootNode} onChange={this.changeRootNode}>
                        <option value="">Select root node</option>
                        {this.state.nodes.map((node, key) => (<option
                            key={key}
                            value={node.id}
                        >{node.displayName}
                        </option>))}
                    </select>
                </div>
                <div className="nonHeader">
                    {this.state.querySelectParams.length > 0 &&
                    <ConditionComponent mockData={mockData} modifyQueryWhereParams={this.modifyQueryWhereParams}/>}
                    <GraphComponent
                        querySelectParams={this.state.querySelectParams}
                        modifyQuerySelectParams={this.modifyQuerySelectParams}
                        mockData={mockData}
                        selectedRootNode={this.state.selectedRootNode}
                    />
                </div>
                <div>
                    {this.state.querySelectParams.length > 0 && <QueryComponent
                        whereString={this.state.whereString}
                        querySelectParams={this.state.querySelectParams}
                    />}
                </div>
            </div>
        );
    }
}

export default HomePage;
