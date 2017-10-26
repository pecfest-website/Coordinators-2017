import React, { Component } from 'react';
import Editor from './Editor';

const prefix = 'http://api.pecfest.in'
export default class EditEvent extends Component {

  getColumns() {
    return [
      {
        key: 'id',
        name: 'ID',
        width: 80,
        forSingle: true,
      },
      {
        key: 'name',
        name: 'Name',
        editable: true,
        forShort: true,
      },
      {
        key: 'category',
        name: 'Category',
        editable: true,
      },
      {
        key:'details',
        name: 'Details',
        editable: true,
      },
      {
        key: 'shortDescription',
        name: 'Short Description',
        editable: true,
      },
      {
        key: 'prize',
        name: 'Prize',
        editable: true,
      },
      {
        key: 'minSize',
        name: 'Team Min Size',
        editable: true,
      },
      {
        key: 'maxSize',
        name: 'Team Max Size',
        editable: true,
      },
      {
        key: 'location',
        name: 'Location',
        editable: true,
      },
      {
        key: 'day',
        name: 'Day',
        editable: true,
      },
      {
        key: 'time',
        name: 'Time',
        editable: true,
      },
      {
        key: 'coordinators',
        name: 'Coordinators',
        editable: true,
      },
      {
        key: 'eventType',
        name: 'Event Type',
        editable: true,
      },
      {
        key: 'pdfUrl',
        name: 'PDF URL',
        editable: true,
      },
      {
        key: 'rulesList',
        name: 'Rules',
        editable: true,
      },
      {
        key: 'registrations',
        name: 'Registrations',
        editable: false
      }
    ]
  }


  render() {
    return (
      <Editor updateUrl={prefix + '/v1/event/update'} createUrl={prefix + '/v1/event/create'}
          columns={this.getColumns()} getAllUrl={prefix + '/v1/events'} getUrl={prefix + '/v1/event/'} />
    )
  }
}
