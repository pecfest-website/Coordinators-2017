import React, { Component } from 'react';

class ListEvents extends Component {
	constructor(props) {
		super(props);

		this.state = {
			events: props.events,
		}
	}

	componentWillRecieveProps(nextProps) {
		this.setState({ events: nextProps.events })
	}

	handleClick = event => {
		this.props.onEventSelect(event.id);
	}

	  handleFilter = ({ target }) => {
	    const search = target.value;

	    const events = this.props.events.filter(event => event.name.toLowerCase().indexOf(search.toLowerCase()) !== -1)
	    this.setState({ events })
	  }


	render() {
		return (
			<div className="col-2">
		        <div className="SearchBox">
		          <input type="search" onChange={this.handleFilter} placeholder={"Type to search"} />
		        </div>
				<ul className="ListEvents">
				{
					this.state.events.map(event => (
						<li key={event.id}
							style={{
								backgroundColor: `${this.props.selected == event.id ? 'rgba(0, 0, 0, 0.2)' : ''}`
							}}
							onClick={this.handleClick.bind(this, event)}>{event.name}</li>

					))
				}
				</ul>
			</div>
		)
	}
}

class UserInfo extends Component {
	state = {
		message: 'Loading...'
	}

	componentDidMount() {
		fetch('http://api.pecfest.in/v1/user/' + this.props.userId)
			.then(res => res.json())
			.then(user => {
				if (user.ACK == 'SUCCESS')
					this.setState({ user, message: `${user.college}`})
				else {
					this.setState({ message: user.message || 'Failed to load'})
				}
			})
			.catch(err => this.setState({ message: err.message || 'Failed to load'}))
	}

	render() {
		return <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>&nbsp;{this.state.message}</span>
	}
}

class Registration extends Component {
	render() {
		return (
			<div className="Registration">
				<div className="Registration-leader">
					Leader: {this.props.registration.leaderId} ({ this.props.registration.leaderName }) <UserInfo userId={this.props.registration.leaderId} />
				</div>
				<div className="Registration-team">
				<small style={{display: 'block'}}>{this.props.registration.team.length === 1 ? '' : 'Team: '}</small>
				{
					this.props.registration.team.length === 1 ? '' :
						this.props.registration.team.map(member => {
							return (
								<div className="Team-member" key={member.id}>
								{member.memberId} ({member.name})
									<UserInfo userId={member.memberId} />
								</div>
							)
						})
				}
				</div>
			</div>
		)
	}
}

class SelectedEvent extends Component {
	state = {
		loading: true,
		status: 'Loading...'
	}

	componentDidMount() {
		fetch('http://api.pecfest.in/v1/event/' + this.props.eventId + '/registrations',
			 { headers: { 'Authorization': 'Basic ' + window.sessionKey }})
			.then(res => res.json())
			.then(registrations => {
				if (registrations.ACK != 'FAILED')
					this.setState({ registrations, registrationsToShow: registrations, loading: false })
				else {
					this.setState({ status: registrations.message || 'FAILED'});
				}
			}).catch(err => {
				this.setState({ status: err.message || 'FAILED'})
			})
	}


	  handleFilter = ({ target }) => {
	    const search = target.value;

	    const registrationsToShow = this.state.registrations.filter(registration => {
	    	for (const member in registration.team) {
	    		if (registration.team[member].name.toLowerCase().indexOf(search.toLowerCase()) !== -1)
	    			return true;
	    	}

	    	return false;
	    })
	    this.setState({ registrationsToShow })
	  }

	render() {
		return (
			<div className="col-5">
				<div className="SearchBox" style={{ margin: '1em'}}>
		          <input type="search" onChange={this.handleFilter} placeholder={"Enter the member/leader name"} />
				</div>
				<div className="SelectedEvent">
					{
						this.state.loading ? <em>{this.state.status}</em> :
							this.state.registrationsToShow.map((registration, i) => <Registration key={i} registration={registration} />)
					}
				</div>
			</div>
		)
	}
}

export default class Registrations extends Component {
	state = {
		loading: true,
		status: 'Loading...'
	}

	componentDidMount() {
		fetch('http://api.pecfest.in/v1/events')
			.then(data => data.json())
			.then(events => this.setState({ events: events.ACK != 'FAILED' ? events : [], status: events.message, loading: events.ACK == 'FAILED' }))
			.catch(err => this.setState({ loading: false, status: err.message || 'Failed to fetch'}))
	}

	handleSelect = (eventId) => {
		this.setState({ eventId, selected: true})
	}

	render() {
		return (
			<div className="Registrations row">
				{
					this.state.loading ? <em>{this.state.status}</em>
						: <ListEvents events={this.state.events} onEventSelect={this.handleSelect} selected={this.state.eventId} />
				}
				{
					this.state.selected ? <SelectedEvent key={this.state.eventId} eventId={this.state.eventId} /> : ""
				}
			</div>
		)
	}
}
