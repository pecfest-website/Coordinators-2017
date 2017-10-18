import React, { Component } from 'react';

export default class New extends Component {
  constructor(props) {
    super(props);

    this.state = {
      event: {},
      status: 'Edit'
    }
  }

  handleSubmit = event => {
    event.stopPropagation();
    event.preventDefault();
    fetch(this.props.createUrl, { method: 'POST', body: JSON.stringify(this.state.event), headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + window.sessionKey } })
      .then(data => data.json())
      .then(res => {
        if (res.ACK == 'SUCCESS') {
          this.setState({ success: true, status: 'Success' })
        } else {
          this.setState({ success: false, status: res.message })
        }
      })
      .catch(err => this.setState({ success: false, status: 'Failed'}));

      this.setState({ submitting: true, status: 'Updating' })
  }

  handleChange = (name, {target}) => {
    const value = target.value;
    const event = this.state.event;
    event[name] = value;
    this.setState({event, status: 'Submit'});
  }

  render() {
    return (
      <form className="table-row" onSubmit={this.handleSubmit}>
        {
          this.props.columns.map(column => {
            return (
              <div className="FormElement table-cell" key={column.key}>
                <input type={column.key == 'maxSize' || column.key == 'minSize' ? 'number' : "text"} value={this.state.event[column.key]}
                  onChange={this.handleChange.bind(this, column.key)}
                  name={column.key} />
              </div>
            )
          })
        }
        <input type="submit" value={this.state.status} disabled={this.state.status != 'Submit'} />
      </form>
    )
  }
}
