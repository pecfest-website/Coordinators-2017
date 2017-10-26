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
          this.setState({ success: true, status: 'Success', pecfestId: res.pecfestId })
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

  renderServerResponse() {
  	if (!this.state.pecfestId) {
  		return "";
  	}
  	if (this.state.status == 'Success')
	  return <div className="Success">PECFEST ID: <span className="darker">{this.state.pecfestId}</span></div>;
	else {
		return "";
	}
  }

  render() {
  	console.log(this.state.event)
    return (
      <form className="table-row" onSubmit={this.handleSubmit} ref="form">
        {
          this.props.columns.map(column => {
            return (
              <div className="FormElement" key={column.key}>
                <label className="FormLabel" htmlFor={column.key}>{column.name}</label>
                <input className="FormInput" type={column.key == 'maxSize' || column.key == 'minSize' ? 'number' : "text"}
                  onChange={this.handleChange.bind(this, column.key)}
                  name={column.key} />
                <br />
              </div>
            )
          })
        }
        <input type="submit" value={this.state.status} disabled={this.state.status != 'Submit'} />
        <input type="reset" value="Reset" onClick={() => {this.refs.form.reset(); this.setState({ event: {} })}} />
        <div className="Server-response">
        	{
        		this.renderServerResponse()
        	}
        </div>
      </form>
    )
  }
}
