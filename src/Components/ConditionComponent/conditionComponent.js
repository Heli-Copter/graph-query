import React from 'react';
import './conditionComponent.scss';
import Condition from '../Condition/condition';
import levelCompare from '../../utils/levelCompare';

class ConditionComponent extends React.Component {
    constructor() {
        super();
        this.handleChange = this.handleChange.bind(this);
        this.conditionProperties = this.conditionProperties.bind(this);
        this.state = {
            propOptions: [],
            condn: {0: {prop: '', op: '', val: ''}},
        };
    }

    componentDidMount() {
        const propOptions = [];
        this.props.mockData.elements.map((element, key) => {
            if (element.data.displayName) {
                Object.keys(element.data).map((prop) => {
                    propOptions.push({id: `${element.data.id}.${prop}`, name: `${element.data.displayName}.${prop}`});
                });
            }
        });
        this.setState({propOptions});
        this.props.modifyQueryWhereParams(this.state.condn);
    }

    handleChange(state, id) {
        const condn = this.state.condn;
        condn[id] = state;
        this.setState({condn});
        this.props.modifyQueryWhereParams(condn);
    }

    addCondition(id) {
        const condn = this.state.condn;
        const prev = JSON.parse(JSON.stringify(condn[id]));
        delete condn[id];
        condn[`${String(id)}.0`] = prev;
        condn[`${String(id)}.1`] = {prop: '', op: '', val: ''};
        this.setState({condn}, () => {
            this.props.modifyQueryWhereParams(condn);
            this.conditionProperties();
        });
    }

    removeCondition(id) {
        const condn = this.state.condn;
        const parallelIndex = condn[id.slice(0, -1) + Number(!(Number(id.slice(-1))))];
        if (parallelIndex) {
            condn[id.slice(0, -2)] = JSON.parse(JSON.stringify(parallelIndex));
        }
        delete condn[id];
        delete condn[id.slice(0, -1) + Number(!(Number(id.slice(-1))))];
        this.setState({condn}, () => {
            this.props.modifyQueryWhereParams(condn);
            this.conditionProperties();
        });
    }

    conditionProperties() {
        // let propLength = new Set();
        // let maxLength = 0;
        // let notPresent = '';
        // let newObject = {};
        // let condn = this.state.condn;
        // Object.keys(condn).sort(levelCompare).map((id) => {
        //   propLength.add(id.length);
        //   maxLength = Math.max(id.length, maxLength);
        // });
        // for(let i = 3; i < maxLength;i++) notPresent = !propLength.has(i) && i%2 !== 0 ? i : '';
        // if(notPresent) {
        //   Object.keys(condn).sort(levelCompare).map((id) => {
        //   if(id.length > notPresent) {
        //     let newID = id.substring(2);
        //     newID = newID.indexOf('1') === 0 ? '0' + newID.substring(1) : newID;
        //     newObject[newID] = condn[id];
        //   } else if (id.length >= 3){
        //     newObject[id] = condn[id];
        //   }
        // });
        // }
    }

    render() {
        return (
            <div className="conditionComponent">
                {
                    Object.keys(this.state.condn).sort(levelCompare).map(id => (<Condition
                        key={id}
                        id={id}
                        state={this.state.condn[id]}
                        handleChange={(state) => {
                            this.handleChange(state, id);
                        }}
                        propOptions={this.state.propOptions}
                        addCondition={() => {
                            this.addCondition(id);
                        }}
                        removeCondition={() => {
                            this.removeCondition(id);
                        }}
                    />))
                }

            </div>
        );
    }
}

export default ConditionComponent;
