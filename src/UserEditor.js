import React, { Component } from 'react';
import Editor from './Editor';

const prefix = 'http://api.pecfest.in'
export default class EditEvent extends Component {

  getColumns() {
    return [
      {
        key: 'pecfestId',
        name: 'PECFEST ID',
        width: 80,
        editable: true,
      },
      {
        key: 'name',
        name: 'Name',
        editable: true,
      },
      {
        key: 'college',
        name: 'College',
        editable: true,
      },
      {
        key:'gender',
        name: 'Gender',
        editable: true,
      },
      {
        key: 'accomodation',
        name: 'Accomodation',
        editable: true,
      },
      {
        key: 'verified',
        name: 'Verified',
        editable: true,
      },
      {
        key: 'mobile',
        name: 'Mobile',
        editable: true,
      },
      {
        key: 'email',
        name: 'Email',
        editable: false
      }
    ]
  }


  render() {
    return (
      <Editor updateUrl={prefix + '/v1/user/update'} createUrl={prefix + '/v1/user/create'} columns={this.getColumns()} getUrl={prefix + '/v1/users'} />
    )
  }
}
