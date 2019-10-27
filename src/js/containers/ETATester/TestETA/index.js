import React, { Component } from 'react';
import { orderBy, findIndex, sumBy, find } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './styles.scss';
import TableList from '../../../components/TableList';
import ListMenu from '../../../components/ListMenu';
import PaperTile from '../../../components/PaperTile';
import RecordMapView from '../../../components/RecordMapView';
import Paper from '@material-ui/core/Paper';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import { Checkbox, FormControlLabel } from '@material-ui/core';

class TestETA extends Component {

  state = {
    featureSets: [],
    selectedFeatureSet: {},
    stations: [],
    skipWaitTilInterval: true
  }

  componentDidMount() {
    this.getJourneyFeatureSets();
    this.getStations();
  }

  getStations = async () => {
    const { eta } = this.props;
    const { route, seq } = eta;
    let url = `http://minibus.azurewebsites.net/api/v2/data/getStations?route=${route}&seq=${seq}`;
    const response = await fetch(url).then(res => res.json());
    await this.setState({ stations: response.response });
    console.log('stations', response.response);
  }

  getJourneyFeatureSets = async () => {
    const { eta } = this.props;
    const { route, seq, weekday, method, generationDate, remark } = eta;
    let url = `http://localhost:3004/api/v2/training/getJourneyFeatureSet?route=${route}&seq=${seq}`;
    const response = await fetch(url).then(res => res.json());
    const featureSets = response.response;
    console.log('featureSets', featureSets);
    this.setState({ featureSets });
  }

  computeETADeviation = async (featureSet) => {
    const { eta } = this.props;
    const { etaIntervalSet } = eta.etaInfo;
    const { i2i } = featureSet;
    for(let i = 0; i < i2i.length; i++) {
      const { from, to } = featureSet.i2i[i];
      featureSet.i2i[i].expected = this.getTimeFromIntervalToInterval(etaIntervalSet, from, to);
      featureSet.i2i[i].diff = featureSet.i2i[i].time - featureSet.i2i[i].expected;
      featureSet.i2i[i].netDiff = Math.abs(featureSet.i2i[i].diff);
    }
    console.log('featureSet i2i diff', featureSet.i2i);
    await this.setState({ selectedFeatureSet: featureSet });
    this.calETAScore();
  }

  getTimeFromIntervalToInterval = (i2i, from, to) => {
    const fromIndex = findIndex(i2i, { from });
    const toIndex = findIndex(i2i, { to });
    let sum = 0;
    for(let i = fromIndex; i === toIndex; i++) {
      sum += i2i[i].time;
    }
    return sum;
  }

  calETAScore = () => {
    const { selectedFeatureSet, stations, skipWaitTilInterval } = this.state;
    const stationsWithBlindSpot = stations.filter(station => station.waitTilInterval);
    const intervalsToSkip = stationsWithBlindSpot.map(({ order, waitTilInterval }) => ({
      from: order,
      to: waitTilInterval
    }));
    console.log('intervalsToSkip', intervalsToSkip);
    const { i2i } = selectedFeatureSet;
    const absAverage = sumBy(i2i, i => {
      const { from, to, diff } = i;
      const shouldIgnore = find(intervalsToSkip, intervalSet => {
        return intervalSet.from >= from && intervalSet.to <= to;
      });
      return shouldIgnore && skipWaitTilInterval ? 0 : Math.abs(diff);
    });
    console.log('absAverage', absAverage);
  }

  renderFeatureSets = (featureSet, index) => {
    const { selectedFeatureSet } = this.state;
    const { _id: id, route, seq, hour, weekday, journeyTime } = featureSet;
    
    return (
      <TableRow hover key={`eta-${index}`} selected={id === selectedFeatureSet._id} onClick={() => this.setState({ selectedFeatureSet: featureSet })}>     
        <TableCell align="left">{route}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{weekday}</TableCell>
        <TableCell align="right">{hour}</TableCell>
        <TableCell align="right">{journeyTime}</TableCell>
        <TableCell align="right">{id}</TableCell>
        <TableCell align="right">
          <Button variant="contained" color="primary" onClick={() => this.computeETADeviation(featureSet)}>
            Test
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  renderI2I = (interval, index) => {
    const { from, to, time, diff, expected } = interval;
    return (
      <TableRow hover key={`interval-${index}`}>     
        <TableCell align="right">{from}</TableCell>
        <TableCell align="right">{to}</TableCell>
        <TableCell align="right">{expected}</TableCell>
        <TableCell align="right">{time}</TableCell>
        <TableCell align="right">{diff}</TableCell>
        <TableCell align="right">{Math.abs(diff)}</TableCell>
      </TableRow>
    )
  }

  scoreETAAgainstJourney = async (etaIntervalSet, i2i) => {
    if(this.state.stations === [])
      await this.getStations();
    const { stations } = this.state;
    // console.log('stations', stations);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked });
  };
  
  render() {
    const { featureSets, selectedFeatureSet, skipWaitTilInterval } = this.state;
    const { i2i } = selectedFeatureSet;
    const { eta } = this.props;
    const { etaInfo, route, seq, weekday, method, generationDate, remark } = eta;
    const { etaIntervalSet } = etaInfo;
    const rows = [
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: false, disablePadding: false, label: 'Sequence' },
      { id: 'weekday', numeric: false, disablePadding: false, label: 'Weekday' },
      { id: 'hour', numeric: false, disablePadding: false, label: 'Hour' },
      { id: 'journeyTime', numeric: true, disablePadding: false, label: 'Journey Time' },
      { id: '_id', numeric: true, disablePadding: false, label: 'ID' },
      { id: 'start', numeric: true, disablePadding: false, label: 'Test' },
    ];
    const i2iRows = [
      { id: 'from', numeric: false, disablePadding: true, label: 'From' },
      { id: 'to', numeric: false, disablePadding: false, label: 'To' },
      { id: 'expected', numeric: true, disablePadding: false, label: 'Expected Duration ' },
      { id: 'time', numeric: true, disablePadding: false, label: 'Actual Duration' },
      { id: 'diff', numeric: false, disablePadding: false, label: 'ETA Error' },
      { id: 'netDiff', numeric: false, disablePadding: false, label: 'Net ETA Error' },
    ];

    return (
      <Row>
        <Col sm={3}>
          <Stepper orientation="vertical">
            {etaIntervalSet.map((label, index) => {
              const { from, to, time } = label;
              return (
                <Step key={`etai2i-${index}`}>
                  <StepLabel icon={<div className='step-label'>{index}</div>}>{time}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </Col>
        <Col sm={9}>
          <Row>
            <Col>
              <PaperTile 
                title='Route'
                content={route}
              />
            </Col>
            <Col>
              <PaperTile 
                title='Seq'
                content={seq}
              />
            </Col>
            <Col>
              <PaperTile 
                title='Weekday'
                content={weekday}
              />
            </Col>
            <Col>
              <PaperTile 
                title='Method'
                content={method}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: 12 }}>
            <Col>
              <PaperTile 
                title='Created at'
                content={`${new Date(generationDate).toLocaleDateString()} ${new Date(generationDate).toLocaleTimeString()}`}
              />
            </Col>
            <Col>
              <PaperTile 
                title='Remark'
                content={remark}
              />
            </Col>
          </Row>
          <TableList 
            rows={rows}
            data={featureSets}
            title={`Feature Set`}
            renderCustomRow={this.renderFeatureSets}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={skipWaitTilInterval}
                onChange={this.handleChange('skipWaitTilInterval')}
                value="skipWaitTilInterval"
              />
            }
            label="Skip waitTilInterval"
          />
          <TableList 
            rows={i2iRows}
            data={i2i || []}
            title={`Interval to Interval Error`}
            renderCustomRow={this.renderI2I}
          />
        </Col>
      </Row>
    )
  }
}

export default TestETA;