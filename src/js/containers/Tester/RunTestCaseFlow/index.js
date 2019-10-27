import React, { Component } from 'react';
import { find, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import { CheckCircleOutline, Loop, PauseCircleOutline, HighlightOff, CheckBox as CheckBoxIcon } from '@material-ui/icons';

import './styles.scss';
import TableList from '../../../components/TableList';
import RecordEditor from '../AddTestCaseFlow/RecordEditor';
import RecordMapView from '../../../components/RecordMapView';
import TestResult from '../../../components/TestResult';
import Progress from '../../../components/Progress';
import NativeListMenu from '../../../components/NativeListMenu';
import { Bar, Scatter } from 'react-chartjs-2';

class RunTestCaseFlow extends Component {

  state = {
    license: `TEST_RUN_${+new Date()}`,
    name: '',
    description: '',
    testResults: [],
    originalCaseRecords: [],
    caseRecords: [],
    runRecords: [],
    pureCoordinates: [],
    predictedTimeScatter: null,
    interval: true,
    speed: false,
    timestamp: false,
    total: 0,
    pending: 0,
    success: 0,
    failed: 0
  }
  
  componentDidMount() {
    this.getTestCase();
    this.getTestResult();
    this.setState({ license: `TEST_RUN_${+new Date()}` });
  }

  componentDidUpdate(prevProps) {
    if(prevProps.match.params.caseId !== this.props.match.params.caseId) {
      this.getTestCase();
      this.getTestResult();
    }
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  getCarConfig = async (license) => {
    const response = await fetch(`http://localhost:7071/api/v2/minibus/getCarConfigs?license=${license}`)
    .then(response => response.json());
    return response.response;
  }

  getTestCase = async () => {
    const { caseId } = this.props.match.params;
    if(!caseId)
      return;
    const response = await fetch(`http://localhost:3008/dashboard/getTestCase?caseId=${caseId}`)
    .then(response => response.json());
    const { records: caseRecords, name, description, route } = response.response[0];
    // console.log('caseRecord', caseRecords);
    this.setState({ 
      name,
      route,
      description,
      originalCaseRecords: caseRecords.map(record => ({ ...record, status: 0 })),
      caseRecords: caseRecords.map(record => ({ ...record, status: 0 })), 
      pureCoordinates: caseRecords.map(({ currentState }) => currentState.location),
      total: caseRecords.length,
      pending: caseRecords.length
    });
  }

  getTestResult = async () => {
    const { caseId } = this.props.match.params;
    if(!caseId)
      return;
    const response = await fetch(`http://localhost:3008/dashboard/getTestResult?caseId=${caseId}`)
    .then(response => response.json());
    const testResults = response.response;
    // console.log('caseRecord', caseRecords);
    this.setState({ 
      testResults
    });
  }

  getETAToCompare = async () => {
    
  }

  startTest = async () => {
    const { caseRecords, interval, speed, timestamp, originalCaseRecords, route, license } = this.state;
    await this.setState({ caseRecords: originalCaseRecords,  total: caseRecords.length, pending: caseRecords.length, success: 0, failed: 0 });
    // const license = `TEST_RUN_1560397261470`
    for(const [i, record] of caseRecords.entries()) {
      // console.log('i', i);
      let { caseRecords } = this.state;
      const carConfig = await this.getCarConfig(license);
      console.log('carConfig', carConfig);
      console.log('startTest route', route)
      caseRecords[i].status = 1;
      await this.setState({ caseRecords })
      const response = await this.processMinibusAPI(license, record.currentState.location, record.currentState.speed, route, record.lastUpdate, record.currentState.provider, record.currentState.accuracy);
      const computedRecord = response.response;
      caseRecords[i].status = 2;
      caseRecords[i].error = {};
      
      if(interval && (!computedRecord.currentState.interval || (computedRecord.currentState.interval !== caseRecords[i].currentState.interval))) {
        caseRecords[i].status = 3;
        caseRecords[i].error.interval = computedRecord.currentState.interval || null;
      }
      if(timestamp && (computedRecord.lastUpdate !== caseRecords[i].lastUpdate)) {
        caseRecords[i].status = 3;
        caseRecords[i].error.lastUpdate = computedRecord.lastUpdate;
      }
      if(speed && (!computedRecord.currentState.speed || (computedRecord.currentState.speed !== caseRecords[i].currentState.speed))) {
        caseRecords[i].status = 3;
        caseRecords[i].error.speed = computedRecord.currentState.speed || null;
      } 
      if(speed && (!computedRecord.currentState.seq || (computedRecord.currentState.seq !== caseRecords[i].currentState.seq))) {
        caseRecords[i].status = 3;
        caseRecords[i].error.seq = computedRecord.currentState.seq || null;
      } 
      await this.setState({ 
        caseRecords,
        pending: this.state.pending - 1,
        ...(caseRecords[i].status === 2 && { success: this.state.success + 1 }),
        ...(caseRecords[i].status === 3 && { failed: this.state.failed + 1 }),
      });
    }
    await this.storeTestResult();
  }

  storeTestResult = async () => {
    const { total, pending, success, failed } = this.state;
    fetch('http://localhost:3008/dashboard/storeTestResult', {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
        caseId: this.props.match.params.caseId,
        total,
        pending,
        success,
        failed,
        timestamp: + new Date(),
      }), 
    }).then(response => response.json());
  }

  processMinibusAPI = (license, location, speed, route, timestamp, provider, accuracy) => {
    // console.log('speed', speed);
    const payload = {
      license,
      location: JSON.stringify(location),
      route,
      timestamp,
      batteryLeft: 101,
      speed,
      provider,
      accuracy,
      gps_mode: 6,
      temp: 0.0
    }
    return fetch('http://localhost:7071/api/v2/record/addLocationRecord', {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify(payload), 
    }).then(response => response.json());
  }

  getIntervalBarData = () => {
    const { originalCaseRecords } = this.state;
    const intervalSet = uniqBy(originalCaseRecords, 'currentState.interval');
    const data = intervalSet.map(({ currentState, ...item }, index) => {
      if(index === 0)
        return 0;
      const { lastUpdate: pastLastUpdate } = intervalSet[index - 1];
      const { interval } = currentState; 
      const { lastUpdate } = item;
      return (lastUpdate - pastLastUpdate)/1000;
    });
    return {
      intervalSet,
      labels: intervalSet.map(({ currentState }) => currentState.interval),
      datasets: [
        {
          label: "interval",
          fillColor: "rgba(220,220,220,0.5)",
          strokeColor: "rgba(220,220,220,0.8)",
          highlightFill: "rgba(220,220,220,0.75)",
          highlightStroke: "rgba(220,220,220,1)",
          data
        }
      ]
    }
      
  }

  getDistanceSet = intervalSet => {
    let accumulatedDistance = 0;
    let accumulatedTime = 0; 
    let actualTime = 0;
    let accumulatedSpeed = 0;
    const data = intervalSet.map((i, index) => {
      const { currentState, lastUpdate } = i;
      const { location, interval, speed } = currentState;
      if(index === 0)
        return { x: 0, y: 0, speed: 0 };
      const pastInterval = intervalSet[index - 1];
      const { lastUpdate: pastLastUpdate } = pastInterval;
      const { location: pastLocation } = pastInterval.currentState;
      const distance = this.getDistance(location.lat, location.lng, pastLocation.lat, pastLocation.lng);
      const time = (lastUpdate - pastLastUpdate)/1000;
      accumulatedDistance += distance;
      accumulatedTime += time;
      accumulatedSpeed = (accumulatedDistance*1000)/accumulatedTime;
      return { x: accumulatedDistance, y: accumulatedTime, speed: (distance*1000)/time, realSpeed: speed, accumulatedSpeed };
    });
    console.log('testing set for csv', data.map( ({ x, y, realSpeed, accumulatedSpeed }) => ({ x, y, speed: realSpeed || 0, accuSpeed: accumulatedSpeed || 0 })))
    return data;
  }

  getAccSpeedSet = distanceSet => {
    return distanceSet.map(i => {
      const { x, accumulatedSpeed } = i;
      // console.log('i', i);
      return { x, y: accumulatedSpeed }
    });
  }

  getDistanceAgainstTime = (distanceSet) => {
    return {
      label: "interval timeline",
      fillColor: "rgba(220,220,220,0.5)",
      strokeColor: "rgba(220,220,220,0.8)",
      highlightFill: "rgba(220,220,220,0.75)",
      highlightStroke: "rgba(220,220,220,1)",
      data: distanceSet
    }
  }

  getAccSpeedAgainstTime = (distanceSet) => {
    return {
      label: "interval real speed",
      fillColor: "rgba(220,220,220,0.5)",
      strokeColor: "rgba(220,220,220,0.8)",
      highlightFill: "rgba(220,220,220,0.75)",
      highlightStroke: "rgba(220,220,220,1)",
      data: this.getAccSpeedSet(distanceSet)
    }
  }

  getPredictedTime = async (route, seq, distance, weekday, speed) => {
    console.log(`getPredictedTime distance: ${distance}, weekday: ${weekday} speed: ${speed}`);
    let url = `http://localhost:3002/api/v2/minibus/predict?route=${route}&seq=${seq}`;
    if(distance !== undefined)
      url += `&distance=${distance}`;
    if(weekday !== undefined)
      url += `&weekday=${weekday}`;
    if(speed !== undefined)
      url += `&speed=${speed}`;
    const result = await fetch(url).then(res => res.json());
    const time = result.response;
    console.log(`distance: ${distance} predicted time: ${time}`);
    return time;
  }

  getPredictedDataSet = async (intervalSet) => {
    const distanceSet = this.getDistanceSet(intervalSet);
    const { caseRecords } = this.state;
    const { route } = caseRecords[0];
    const { seq } = caseRecords[0].currentState;
    let results = [];
    for (const d of distanceSet) {
      console.log('d', d)
      const { x: distance, speed } = d;
      const time = await this.getPredictedTime(route, seq, distance, 0, speed);
      results.push({ x: distance, y: time })
    }
    await this.setState({ predictedTimeScatter: {
      label: "predicted Timeline",
      fillColor: "rgba(119,0,99,0.8)",
      strokeColor: "rgba(119,0,99,0.8)",
      highlightFill: "rgba(119,0,99,0.8)",
      highlightStroke: "rgba(119,0,99,0.8)",
      data: results
    } });
  }

  getDistance(lat1, lng1, lat2, lng2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat1-lat2);  // deg2rad below
    var dLon = this.deg2rad(lng1-lng2);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  renderRecords = (targetRecord, index) => {
    const { _id: recordId, lastUpdate, currentState, status, error } = targetRecord;
    const { interval, journeyId, stationTimeDifference, seq, passedStation, trigger } = currentState;
    const { outRoute } = trigger;

    return (
      <TableRow hover key={`record-${recordId}`}>     
        <TableCell align="left">{
          status === 3 ? <HighlightOff color="secondary" /> :
          status === 2 ? <CheckCircleOutline color="primary" /> :
          status === 1 ? <Loop /> : <PauseCircleOutline color="action" />
        }</TableCell>
        <TableCell align="right">{recordId}</TableCell>
        <TableCell align="right">{interval}</TableCell>
        <TableCell align="right">{passedStation}</TableCell>
        <TableCell align="right">{stationTimeDifference}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{outRoute}</TableCell>
        <TableCell align="right">{lastUpdate}</TableCell>
        <TableCell align="right">{journeyId}</TableCell>
        <TableCell align="right">{JSON.stringify(error)}</TableCell>
      </TableRow>
    )
  }

  renderResults = (targetResult, index) => {
    const { _id: resultId, total, pending, success, failed, timestamp } = targetResult;

    return (
      <TableRow hover key={`result-${resultId}`}>     
        <TableCell align="right">
          <Progress 
            val={success}
            total={total}
            name={'Success'}
            color="primary"
          />
        </TableCell>
        <TableCell align="right">
          <Progress 
            val={failed}
            total={total}
            name={'Failed'}
            color="secondary"
          />
        </TableCell>
        <TableCell align="right">
          <Progress 
            val={(total - pending)}
            total={total}
            name={'Total'}
            color="determine"
          />
        </TableCell>
        <TableCell align="right">{total}</TableCell>
        <TableCell align="right">{`${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}`}</TableCell>
        <TableCell align="right">{timestamp}</TableCell>
      </TableRow>
    )
  }

  render() {
    const { caseRecords, 
      pureCoordinates, 
      interval, speed, 
      timestamp, name, description, 
      pending, success, failed, total, 
      testResults, weekday, hour, predictedTimeScatter } = this.state;
    console.log('predictedTimeScatter', predictedTimeScatter);
    const rows = [
      { id: 'status', numeric: false, disablePadding: false, label: 'Status' },
      { id: '_id', numeric: false, disablePadding: false, label: 'Record Index' },
      { id: 'currentState.interval', numeric: true, disablePadding: false, label: 'Interval' },
      { id: 'currentState.passedStation', numeric: true, disablePadding: false, label: 'Station No.' },
      { id: 'currentState.stationTimeDifference', numeric: true, disablePadding: false, label: 'Station Time Diff' },
      { id: 'currentState.seq', numeric: true, disablePadding: false, label: 'Sequence' },
      { id: 'currentState.trigger.outRoute', numeric: true, disablePadding: false, label: 'outRoute' },
      { id: 'lastUpdate', numeric: true, disablePadding: false, label: 'Timestamp' },
      { id: 'currentState.journeyId', numeric: true, disablePadding: false, label: 'Journey ID' },
      { id: 'error', numeric: true, disablePadding: false, label: 'Error' },
    ];
    const resultRows = [
      { id: 'success', numeric: false, disablePadding: false, label: 'Success' },
      { id: 'failed', numeric: false, disablePadding: false, label: 'Failed' },
      { id: 'pending', numeric: false, disablePadding: false, label: 'Pending' },
      { id: 'total', numeric: true, disablePadding: false, label: 'Total' },
      { id: 'date', numeric: false, disablePadding: false, label: 'Date' },
      { id: 'timestamp', numeric: true, disablePadding: false, label: 'Timestamp' },
    ];
    const barData = this.getIntervalBarData();
    const intervalSet = barData.intervalSet;
    const distanceSet = this.getDistanceSet(intervalSet);
    const scatterDataset = this.getDistanceAgainstTime(distanceSet);
    const accSpeedDataset = this.getAccSpeedAgainstTime(distanceSet);
    const datasets = predictedTimeScatter ? [scatterDataset, predictedTimeScatter] : [scatterDataset];

    return (
      <div className='tester'>
        <Row>
          <Col sm={6}>
            <RecordMapView 
              pureCoordinates={pureCoordinates}
              records={caseRecords}
              lineView
            />
          </Col>
          <Col sm={6}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={interval}
                    onChange={this.handleChange('interval')}
                    value="interval"
                  />
                }
                label="Interval"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={speed}
                    onChange={this.handleChange('speed')}
                    value="speed"
                  />
                }
                label="Speed"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={timestamp}
                    onChange={this.handleChange('timestamp')}
                    value="timestamp"
                  />
                }
                label="Timestamp"
              />
            </FormGroup>
            <div>
              <h2>{name}</h2>
              <p>{description}</p>
            </div>
            <TableList 
              rows={rows}
              data={caseRecords}
              title={`Test case`}
              renderCustomRow={this.renderRecords}
            />
            <Button variant="contained" color="primary" onClick={() => this.startTest()}>
              Start Test
            </Button>
            <TestResult 
              total={total}
              success={success}
              failed={failed}
              pending={pending}
            />
            <Bar data={barData} options={{
              scales: {
                // yAxes: [{
                //   ticks: {
                //       min: 0, // minimum value
                //       max: 200 // maximum value
                //   }
                // }]
            },
              //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
              scaleBeginAtZero : true,
            
              //Boolean - Whether grid lines are shown across the chart
              scaleShowGridLines : true,
            
              //String - Colour of the grid lines
              scaleGridLineColor : "rgba(0,0,0,.05)",
            
              //Number - Width of the grid lines
              scaleGridLineWidth : 1,
            
              //Boolean - Whether to show horizontal lines (except X axis)
              scaleShowHorizontalLines: true,
            
              //Boolean - Whether to show vertical lines (except Y axis)
              scaleShowVerticalLines: true,
            
              //Boolean - If there is a stroke on each bar
              barShowStroke : true,
            
              //Number - Pixel width of the bar stroke
              barStrokeWidth : 2,
            
              //Number - Spacing between each of the X value sets
              barValueSpacing : 5,
            
              //Number - Spacing between data sets within X values
              barDatasetSpacing : 1,
            }}/>
            <Scatter data={{
              datasets
            }} options={{}} />
            <Scatter data={{
              datasets: [accSpeedDataset]
            }} options={{}} />
            <Button variant="contained" color="primary" onClick={() => this.getPredictedDataSet(barData.intervalSet)}>
              Get Predicted Time
            </Button>
            <TableList 
              rows={resultRows}
              data={testResults}
              title={`Test results`}
              renderCustomRow={this.renderResults}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(RunTestCaseFlow);