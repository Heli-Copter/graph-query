import React from 'react';
import './header.scss';


class Header extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <h1 className="heading">Graph Query</h1>
        );
    }
}

export default Header;
