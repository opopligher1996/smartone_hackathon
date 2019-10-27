import React, { Component } from 'react';
import { orderBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './styles.scss';
import TableList from '../../components/TableList';
import ListMenu from '../../components/ListMenu';
import RecordMapView from '../../components/RecordMapView';

class Tester extends Component {

  state = {
    cases: [],
    selectedCaseId: 0,
    selectedCase: null,
    caseTrace: [],
    pureCoordinates: [],
  }

  componentDidMount() {
    this.getTestCases();
  }

  getTestCases = async () => {
    const response = await fetch('http://localhost:3008/dashboard/getTestCase?noRecord=true')
    .then(response => response.json());
    this.setState({ cases: response.response });
  }

  getFullTestCase = async ({ _id: caseId}) => {
    const response = await fetch(`http://localhost:3008/dashboard/getTestCase?caseId=${caseId}`)
    .then(response => response.json());
    const caseTrace = response.response[0].records;
    this.setState({ 
      caseTrace, 
      pureCoordinates: caseTrace.map(({ currentState }) => currentState.location)
    });
  }

  setCase = (targetCase) => {
    this.setState({ selectedCaseId: targetCase._id });
    this.getFullTestCase(targetCase);
  }

  renderCases = (targetCase) => {
    const { _id: caseId, name, description, route, seq, timestamp } = targetCase;
    const { selectedCaseId } = this.state;
    return (
      <TableRow hover key={caseId} selected={caseId === selectedCaseId} onClick={() => this.setCase(targetCase)}>     
        <TableCell align="right">{caseId}</TableCell>
        <TableCell align="right">{name}</TableCell>
        <TableCell align="right">{description}</TableCell>
        <TableCell align="right">{route}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{`${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}`}</TableCell>
        <TableCell align="right">{timestamp}</TableCell>
        <TableCell align="right">
          <Button component={Link} variant="contained" color="primary" to={`/tester/run-test/${caseId}`}>
            Run
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  render() {
    const { cases, pureCoordinates, caseTrace } = this.state;
    const rows = [
      { id: '_id', numeric: false, disablePadding: false, label: 'Journey ID' },
      { id: 'name', numeric: false, disablePadding: false, label: 'Name' },
      { id: 'description', numeric: false, disablePadding: false, label: 'Description' },
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: true, disablePadding: false, label: 'Sequence' },
      { id: 'date', numeric: true, disablePadding: false, label: 'Date' },
      { id: 'timestamp', numeric: true, disablePadding: false, label: 'Timestamp' },
      { id: 'run', numeric: true, disablePadding: false, label: 'Run' },
    ];
    const viewOptions = [
      'Please select view',
      'raw',
      'interval',
      'timeDiff',
      'speed'
    ];

    return (
      <div className='tester'>
        <h1>Tester</h1>
        <Row>
          <Col sm={6}>
            <RecordMapView 
              options={viewOptions}
              pureCoordinates={pureCoordinates}
              records={caseTrace}
            />
          </Col>
          <Col sm={6} className='case-list-container'>
            <TableList 
              rows={rows}
              data={cases}
              title={'Test Cases'}
              renderCustomRow={this.renderCases}
            />
            <Button component={Link} variant="contained" color="primary" to="/tester/add-test-case">
              Add New Test Case
            </Button>
            <Button component={Link} variant="contained" color="primary" to="/tester/live-test">
              Live Test
            </Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(Tester);