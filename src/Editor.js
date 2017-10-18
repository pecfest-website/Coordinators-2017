import React, { Component } from 'react';
import './App.css';

import New from './New';

class Form extends Component {
  constructor(props) {
    super(props);

    this.state = {
      event: props.event,
      status: 'Edit'
    }
  }

  handleSubmit = event => {
    event.stopPropagation();
    event.preventDefault();
    fetch(this.props.updateUrl, { method: 'POST', body: JSON.stringify(this.state.event),
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + window.sessionKey } })
      .then(data => data.json())
      .then(res => {
        if (res.ACK == 'SUCCESS') {
          this.setState({ success: true, status: 'Success' })
        } else {
          this.setState({ success: false, status: res.message || 'Failed' })
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
                  disabled={!column.editable} name={column.key} />
              </div>
            )
          })
        }
        <input type="submit" value={this.state.status} disabled={this.state.status != 'Submit'} />
      </form>
    )
  }
}

class EditEvent extends Component {

  state = {
    events: [],
    loading: true,
    add: false,
    status: 'Loading...'
  }

  componentDidMount() {
    fetch(this.props.getUrl, { headers: { 'Authorization': 'Basic ' + window.sessionKey }})
      .then(data  => data.json())
      .then(events => {
        if (events.ACK && events.ACK == 'FAILED') {
          this.setState({ status: events.message })
          return;
        }
        this.setState({ events, loading: false })

      })
  }

  getRow(i) {
    return this.state.events[i]
  }

  handleAdd = () => {
    this.setState({ add: true })
  }

  render() {
    if (this.state.loading) {
      return <p style={{ textAlign: 'center'}}><em>{this.state.status}</em></p>
    }
    return (
      <div className="App">
        <button onClick={this.handleAdd}>Create New</button>
        <div className="table-header">
        {
          this.props.columns.map(column => {
            return (
                <div className="table-cell" key={column.key}>
                  {column.name}
                </div>
            )
          })
        }
        </div>
        {this.state.add ? <New columns={this.props.columns} createUrl={this.props.createUrl} /> : "" }
        {
          this.state.events.map(event => {
            return (
              <Form event={event} key={event.id} columns={this.props.columns} updateUrl={this.props.updateUrl} />
            )
          })
        }
      </div>
    );
  }
}

export default EditEvent;
