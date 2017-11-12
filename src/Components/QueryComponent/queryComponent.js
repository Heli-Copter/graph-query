import React from 'react';
import './queryComponent.scss';

class QueryComponent extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <div className='queryComponent'>
                <div>SELECT {this.props.querySelectParams.join()}</div>
                <button className='run'>Run</button>
            </div>
        );
    }
}

export default QueryComponent;
