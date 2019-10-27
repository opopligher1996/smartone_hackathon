import React, { Component } from 'react';
import { orderBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './styles.scss';
import { TextField, Button } from '@material-ui/core';
import TableList from '../../../../components/TableList';

class StartLiveTest extends Component {

  state = {
    selectedRecordId: 0
  }

  setRecord = (targetRecord) => {
    this.setState({ selectedRecordIndex: targetRecord.index });
  }

  renderRecords = (targetRecord) => {
    const { disableEdit } = this.props;
    const { recordId, lastUpdate, currentState } = targetRecord;
    const { interval, journeyId } = currentState;
    const { selectedRecordId } = this.state;
    return (
      <TableRow hover key={`record-${recordId}`} selected={recordId === selectedRecordId} onClick={() => this.setRecord(targetRecord)}>     
        <TableCell align="left">
          {recordId}
        </TableCell>
        <TableCell align="right">{disableEdit ? interval : this.renderEditInput(interval, recordId)}</TableCell>
        <TableCell align="right">{lastUpdate}</TableCell>
        <TableCell align="right">{journeyId}</TableCell>
      </TableRow>
    )
  }

  renderEditInput = (val, recordId) => {
    const { updateRecords } = this.props;
    return (
      <TextField
        id={`edit-${recordId}`}
        label="Edit"
        value={val}
        onChange={updateRecords(recordId)}
        margin="normal"
      />
    )
  }

  render() {
    const { records, locked } = this.props;
    const rows = [
      { id: '_id', numeric: false, disablePadding: false, label: 'Record Index' },
      { id: 'currentState.interval', numeric: true, disablePadding: false, label: 'Interval' },
      { id: 'lastUpdate', numeric: true, disablePadding: false, label: 'Timestamp' },
      { id: 'currentState.journeyId', numeric: true, disablePadding: false, label: 'Journey ID' },
    ];

    return (
      <TableList 
        rows={rows}
        data={records}
        title={`Live test trace ${locked ? '(Review)' : ''}`}
        renderCustomRow={this.renderRecords}
      />
    )
  }
}

export default StartLiveTest;