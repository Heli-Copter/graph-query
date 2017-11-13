import React from 'react';
import './condition.scss';

class Condition extends React.Component {
  constructor(props) {
    super(props);
    this.inputChange = this.inputChange.bind(this);
    this.addCondn = this.addCondn.bind(this);
    this.removeCondn = this.removeCondn.bind(this);
    this.state = this.props.state;
  }

  inputChange(event) {
    this.setState({ [event.target.name]: event.target.value }, () => {
      this.props.handleChange(this.state);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({prop: nextProps.state.prop, op: nextProps.state.op, val: nextProps.state.val});
  }

  addCondn() {
    this.props.addCondition();
  }

  removeCondn() {
    this.props.removeCondition();
  }

  render() {
    return (
      <div className="condition" style={{ marginLeft: `${String((this.props.id.match(/\./g) || []).length * 20)}px` }}>
        <div>
          <select name="prop" value={this.state.prop} onChange={this.inputChange}>
            <option value="">Select Prop</option>
            {this.props.propOptions.map((opt, key) => <option key={key} value={opt.id}>{opt.name}</option>)}
          </select>
        </div>

        <div>
          <select name="op" value={this.state.op} onChange={this.inputChange}>
            <option value="">Select Operator</option>
            <option value="is">is</option>
            <option value="isNot">is not</option>
            <option value="lessThan">less than</option>
            <option value="greaterThan">greater than</option>
          </select>
        </div>

        <div>
          <input name="val" value={this.state.val} onChange={this.inputChange} />
        </div>
        <div className="add" onClick={this.addCondn} />
        {this.props.id !== '0' && <div className="remove" onClick={this.removeCondn} />}
      </div>
    );
  }
}

export default Condition;
