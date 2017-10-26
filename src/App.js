import React, { Component } from 'react';
import { BrowserRouter, Route, Link } from 'react-router-dom';
import Registrations from './Registrations';
import './App.css';

import EditEvent from './EditEvent';
import UserEditor from './UserEditor';

class Login extends Component {
  state = {
    status: 'Login'
  }

  handleChange = (name, {target}) => {
    this.setState({ [name]: target.value, status: 'Login' });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.state.userId.length < 1 || this.state.password.length < 1) {
      this.setState({ error: true, status: 'Fields cannot be empty'})
      return;
    }

    fetch('http://api.pecfest.in/v1/portal/user/coordinator', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(this.state.userId + ':' + this.state.password)
      }
    }).then(data => data.json())
      .then(res => {
        if (res.ACK === 'SUCCESS') {
          window.sessionKey = res.sessionKey
          window.localStorage.setItem('sessionKey', res.sessionKey);
          window.localStorage.setItem('loggedIn', true);
          this.props.onLogin();
        } else {
          this.setState({ error: true, status: res.message || 'Failed' })
        }
      }).catch(err => { this.setState({ error: true, status: err.message })});

    this.setState({ status: 'Logging in...'})
  }

  componentDidMount() {
    if (window.localStorage.getItem('loggedIn') == true) {
      window.sessionKey = window.localStorage.getItem('sessionKey')
      this.props.onLogin();
    }
  }

  render() {
    return (
      <div className="Login">
        <form className="Login-form" onSubmit={this.handleSubmit}>
          <div className="Login-element">
            <label htmlFor="userId">User ID</label>
            <input type="text" name="userId" onChange={this.handleChange.bind(this, "userId")} />
          </div>
          <div className="Login-element">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" onChange={this.handleChange.bind(this, 'password')} />
          </div>
          <div className="Login-submit">
            <input type="submit" value={this.state.status} disabled={this.state.status != 'Login'} />
          </div>
        </form>
      </div>
    )
  }
}

export default class App extends Component {
  state = {
    loggedIn: false
  }

  handleLogin = () => {
    this.setState({ loggedIn: true })
  }

  render() {
    return (
      <div className="App">
        {
          this.state.loggedIn ?
            <BrowserRouter>
              <div className="Editors">
                <div className="Editors-links">
                  <Link to="/users">Users</Link>
                  &nbsp;|&nbsp;
                  <Link to="/events">Events</Link>
                  &nbsp;|&nbsp;
                  <Link to="/registrations">Registrations</Link>
                </div>
                <br />
                <Route path="/events" exact component={EditEvent} />
                <Route path="/users" exact component={UserEditor} />
                <Route path="/registrations" exact component={Registrations} />
              </div>
            </BrowserRouter>
            : <Login onLogin={this.handleLogin} />
        }
      </div>
    )
  }
}
