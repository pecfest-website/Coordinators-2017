import React, { Component } from 'react';
import './App.css';
import './Editor.css';

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
    console.log(this.props.columns)
    return (
      <form className="Form" onSubmit={this.handleSubmit}>
        {
          this.props.columns.map(column => {
            return (
              <div className="FormElement" key={column.key}>
                <label className="FormLabel" htmlFor={column.key}>{column.name}</label>
                <input className="FormInput" type={column.key == 'maxSize' || column.key == 'minSize' ? 'number' : "text"} value={this.state.event[column.key]}
                  onChange={this.handleChange.bind(this, column.key)}
                  disabled={!column.editable} name={column.key} />
                <br />
              </div>
            )
          })
        }
        <input type="submit" value={this.state.status} disabled={this.state.status != 'Submit'} />
      </form>
    )
  }
}

class FetchForm extends Component {
  state = {
    loading: true,
    status: 'Loading...'
  }

  fetchEvent() {
    fetch(this.props.getUrl + this.props.eventId, { headers: { 'Authorization': 'Basic ' + window.sessionKey }})
      .then(data => data.json())
      .then(event => {
        if (event.ACK == 'FAILED') {
          this.setState({ loading: false, status: event.message || 'Failed to fetch event ' + this.props.eventId })
          return;
        }

        this.setState({ loading: false, status: 'SUCCESS', event })
      })
  }

  componentDidMount() {
    this.fetchEvent()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.eventId != this.props.eventId) {
      this.fetchEvent()
      this.setState({ loading: true, status: 'Loading...'})
    }
  }

  render() {
    return (
      <div className="FetchForm">
        { this.state.loading ? <em>{this.state.status}</em> : <Form columns={this.props.columns} event={this.state.event} updateUrl={this.props.updateUrl} />}
      </div>
    )
  }
}

class Switch extends Component {
  state = {
    selected: false
  }

  handleClick = () => {
    this.props.onChange(!this.state.selected);
    this.setState({ selected: !this.state.selected });
  }

  render() {
    return (
      <div className={"Switch" + " " + (this.state.selected ? "selected" : "") } onClick={this.handleClick}>
        {this.props.name}
      </div>
    )
  }
}

class EventsSidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      events: props.events,
      search: '',
      switches: []
    }
  }

  applySearchFilter(events, search) {
    return events.filter(event => {
      return (event[this.props.column.key].toLowerCase().indexOf(search.toLowerCase()) !== -1)
              || (this.props.keyColumn ? event[this.props.keyColumn.key].toLowerCase().indexOf(search.toLowerCase()) !== -1 : false);
    });
  }

  applyFilters() {
    let events = this.props.events;
    events = this.applySearchFilter(events, this.state.search);
    events = this.applySwitchFilters(events);
    return events;
  }

  applySwitchFilter(events, swtch) {
    console.log("Applygin switch ", swtch)
    return events.filter(event => !!parseInt(event[swtch]));
  }

  applySwitchFilters(evts) {
    let events = evts;
    for (let swtch in this.state.switches) {
      events = this.applySwitchFilter(events, this.state.switches[swtch]);
    }

    return events;
  }

  handleFilter = ({ target }) => {
    const search = target.value;
    this.setState({ search })
  }

  renderSwitches() {
    const switchColumns = this.props.columns.filter(column => column.forSwitch);

    return switchColumns.map((column, i) => {
      return (
        <Switch key={i} onChange={this.handleSwitchFilter.bind(this, column.key)} name={column.name} />
      )
    })
  }

  handleSwitchFilter = (key, value) => {
    let switches = this.state.switches;
    console.log(key, value);
    if (value) {
      if (typeof switches.find(s => s === key) === 'undefined') {
        switches.push(key);
        this.setState({ switches })
      }
    } else {
      if (typeof switches.find(s => s === key) !== 'undefined') {
        switches = switches.filter(s => s !== key);
        this.setState({ switches })
      }
    }
  }

  render() {
    const events = this.applyFilters();
    return (
      <div className="EventsSidebar">
        <div className="stats">
          Total: {this.props.events.length}, Filtered: {events.length}
        </div>
        <div className="SearchBox">
          <input type="search" onChange={this.handleFilter} placeholder={"Type to search"} />
        </div>
        <div className="Switches">
          {this.renderSwitches()}
        </div>
        <ul>
          {
            events.map((event, i) => (
              <li key={i} onClick={() => this.props.onSelect(event)} className="Eventsheading">{
                event[this.props.column.key]
              }<span style={{color: 'rgba(0, 0, 0, 0.4)'}}>&nbsp;{this.props.keyColumn ? event[this.props.keyColumn.key] : ""}</span></li>
            ))
          }
        </ul>
      </div>
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
    fetch(this.props.getAllUrl, { headers: { 'Authorization': 'Basic ' + window.sessionKey }})
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

  handleSelect = (event) => {
    this.setState({ eventId: event[this.props.columns.find(col => col.forSingle).key], add: false })
  }

  render() {
    if (this.state.loading) {
      return <p style={{ textAlign: 'center'}}><em>{this.state.status}</em></p>
    }
    console.log(this.props.columns)
    return (
      <div className="App">
        <button onClick={this.handleAdd}>Create New</button>

        <div className="Flex">
          { this.state.loading ? <em>{this.state.status}</em> : <EventsSidebar onSelect={this.handleSelect} events={this.state.events} column={this.props.columns.find(col => col.forShort)} keyColumn={this.props.columns.find(col => col.forName)} columns={this.props.columns} />}

          { this.state.eventId || this.state.add ?
        (this.state.add ? <New columns={this.props.columns} createUrl={this.props.createUrl} /> : <FetchForm eventId={this.state.eventId} getUrl={this.props.getUrl} columns={this.props.columns} updateUrl={this.props.updateUrl} />) : ""}
        </div>
      </div>
    );
  }
}

export default EditEvent;
