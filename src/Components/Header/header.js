import React from 'react';
import './header.scss';


class Header extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <h1 className="heading">Graph Query - The query generator for graph data structure.</h1>
        );
    }
}

export default Header;
