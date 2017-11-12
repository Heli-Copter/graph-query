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
                SELECT {this.props.querySelectParams.join()}
            </div>
        );
    }
}

export default QueryComponent;
