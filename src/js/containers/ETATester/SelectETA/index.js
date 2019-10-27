import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './styles.scss';
import TableList from '../../../components/TableList';
import ListMenu from '../../../components/ListMenu';
import RecordMapView from '../../../components/RecordMapView';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import PaperTile from '../../../components/PaperTile';
import NativeListMenu from '../../../components/NativeListMenu';
import CheckboxList from '../../../components/CheckboxList';
import ReviewETA from '../ReviewETA';
import ETAPerfCard from '../../../components/ETAPerfCard';
import ETASelector from '../../../components/ETASelector';

class SelectETA extends Component {

  state = {
    etas: [],
    featureSets: [],
    selectedFsIds: [],
    weekdayAsFilter: false,
    route: '11',
    seq: '1',
    weekday: null,
    mean: true,
    mean10: true,
    median: true,
    generatedETAs: [],
    distanceToTime: {},
    degree: 3,
    ml: [],
    etaPayload: null
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(
        prevState.route !== this.state.route || 
        prevState.seq !== this.state.seq || 
        prevState.weekday !== this.state.weekday || 
        prevState.weekdayAsFilter !== this.state.weekdayAsFilter
      ) {
        this.getFeatureSets();
      }
      
  }

  getFeatureSets = async () => {
    const { route, seq, weekday, weekdayAsFilter } = this.state;
    let url = `http://localhost:3004/api/v2/training/getJourneyFeatureSet?route=${route}&seq=${seq}`;
    if(weekdayAsFilter && weekday)
      url += `&weekday=${weekday}`;
    const response = await fetch(url).then(res => res.json());
    const featureSets = response.response;
    this.setState({ featureSets, selectedFsIds: [] });
  }

  handleCheck = (fsId) => {
    let { selectedFsIds } = this.state;
    const isChecked = indexOf(selectedFsIds, fsId) !== -1;
    if(isChecked) {
      remove(selectedFsIds, val => val === fsId);
      this.setState({ selectedFsIds });
    } else
      this.setState({ selectedFsIds: selectedFsIds.concat([fsId]) });
  }

  handleFilterCheck = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  handleETACheck = name => event => {
    console.log('event.target.checked', event.target.checked);
    console.log(`${name} ${event.target.checked}`);
    this.setState({ [name]: event.target.checked });
  };

  generateETA = async () => {
    const { mean, mean10, median, selectedFsIds } = this.state;
    let etaTypeToGenerate = [];
    if(mean)
      etaTypeToGenerate.push("mean");
    if(mean10)
      etaTypeToGenerate.push("mean10");
    if(median)
      etaTypeToGenerate.push("median");
    let url = `http://localhost:3004/api/v2/training/computeMultipleETAInfo?methods=${JSON.stringify(etaTypeToGenerate)}&featureSetList=${JSON.stringify(selectedFsIds)}&filters=${JSON.stringify([ { from: 0, to: 3 },
    { from: 24, to: 25 } ])}`;
    const response = await fetch(url).then(res => res.json());
    console.log('response', response.response);
    this.setState({ generatedETAs: response.response });
  }

  computeETAByML = async () => {
    await this.setState({ ml: [] });
    const { selectedFsIds, route, seq, degree } = this.state;
    const payload = {
      featureSetList: selectedFsIds,
      route,
      seq,
      degree,
      surpress: [
        { from: 0, to: 1 },
        // { from: 25, to: 26 },
        // { from: 35, to: 36 },
      ]
    };
    this.setState({ etaPayload: payload })
    let urls = [
      { name: "lr", url: `http://localhost:3004/api/v2/training/computeETAByMultivariateNonLinear` },
      { name: "lrs", url: `http://localhost:3004/api/v2/training/computeETAByMultivariateNonLinearWithSpeed` },
      { name: "nlr", url: `http://localhost:3004/api/v2/training/computeETAByPolynomialRegression` },
      // { name: "nn", url: `http://localhost:3004/api/v2/training/computeETAByNN` },
    ];
    const tasks = urls.map(async ({ name, url }) => {
      const response = await fetch(url, {
        body: JSON.stringify(payload), // must match 'Content-Type' header
        headers: {
          'content-type': 'application/json'
        },
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
      }).then(res => res.json());
      const result = response.response;
      if(result.x) {
        this.setState({ distanceToTime: result });
        console.log('for csv', this.getcsv(result));
      }
      this.setState({ ml: this.state.ml.concat([{
        name,
        ...result,
        url
      }]) });
      return response.response;
    });
    await Promise.all(tasks);
  }

  getcsv = (result) => {
    const formatted = result.x.map((val, index) => ({ x: val, y: result.y[index], speed: result.speed[index] || 0, iSpeed: result.iSpeed[index] }));
    const withAccuSpeed = formatted.map(point => {
      const { x, y } = point;
      return {
        ...point,
        accuSpeed: (x*1000)/y || 0
      }
    });
    return withAccuSpeed;
  }

  storeETA = async (computeURL) => {
    const { etaPayload: payload } = this.state;
    const url = computeURL.replace("compute", "store");
    const response = await fetch(url, {
      body: JSON.stringify({
        ...payload,

      }), // must match 'Content-Type' header
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
    }).then(res => res.json());
    console.log('stored', response);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleFilterChange = (name, val) => {
    this.setState({ [name]: val });
  }

  renderFeatureSet = (fs, index) => {
    const { selectedFsIds } = this.state;
    const { _id: fsId, route, seq, weekday, hour, journeyTime, journeyId } = fs;
    // console.log('selectedFsIds', selectedFsIds);
    
    return (
      <TableRow hover key={`fs-${index}`} >     
        <TableCell align="left" padding="checkbox">
          <Checkbox
            checked={indexOf(selectedFsIds, fsId) !== -1}
            onChange={() => this.handleCheck(fsId)}
            // value={`checked-${fsId}`}
          />
        </TableCell>
        <TableCell align="left">{route}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{weekday}</TableCell>
        <TableCell align="right">{hour}</TableCell>
        <TableCell align="right">{journeyTime}</TableCell>
        <TableCell align="right">{journeyId}</TableCell>
      </TableRow>
    )
  }

  renderETAPerfCards = () => {
    let { ml } = this.state;
    const rankedMl = orderBy(ml, ['meanLoss', 'maxLoss'], ['asc', 'asc']);
    return rankedMl.map(({ name, meanLoss, maxLoss, url }, index) => {
      return (
        <Col>
          <ETAPerfCard 
            rank={index + 1}
            name={name}
            meanLoss={meanLoss}
            maxLoss={maxLoss}
            saveETAFunc={() => this.storeETA(url)}
          />
        </Col>
      )
    })
  }

  render() {
    const { etas, featureSets, selectedFsIds, weekdayAsFilter, route, seq, weekday, mean, mean10, median, generatedETAs, distanceToTime, degree, ml } = this.state;
    console.log('ml', ml);
    // const { route, seq, weekday } = eta;

    const rows = [
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: false, disablePadding: false, label: 'Sequence' },
      { id: 'weekday', numeric: false, disablePadding: false, label: 'Weekday' },
      { id: 'hour', numeric: false, disablePadding: false, label: 'Hour' },
      { id: 'generationDate', numeric: true, disablePadding: false, label: 'Timestamp' },
      { id: 'date', numeric: true, disablePadding: false, label: 'Generated at' },
      { id: 'method', numeric: true, disablePadding: false, label: 'Method' },
      { id: 'isBase', numeric: false, disablePadding: false, label: 'Is Base?' },
      { id: 'remark', numeric: false, disablePadding: false, label: 'Remark' },
    ];
    const featureSetRows = [
      { id: 'checked', numeric: false, disablePadding: false, label: 'Selected' },
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: false, disablePadding: false, label: 'Sequence' },
      { id: 'weekday', numeric: false, disablePadding: false, label: 'Weekday' },
      { id: 'hour', numeric: false, disablePadding: false, label: 'Hour' },
      { id: 'journeyTime', numeric: false, disablePadding: false, label: 'Journey Time' },
      { id: 'journeyId', numeric: true, disablePadding: false, label: 'Journey ID' },
    ];

    return (
      <div className='tester'>
        <ETASelector 
          handleChange={this.handleFilterChange}
          onSelectETA={this.props.onSelectETA}
        />
        <TableList 
          rows={featureSetRows}
          data={featureSets}
          title={`Corresponding featureSet`}
          renderCustomRow={this.renderFeatureSet}
        />
        <Row>
          <Col>
            <PaperTile 
              title={'Route'}
              content={route}
            />
          </Col>
          <Col>
            <PaperTile 
              title={'Seq'}
              content={seq}
            />
          </Col>
          {
            weekdayAsFilter && 
            <Col>
              <PaperTile 
                title={'Weekday'}
                content={weekday}
              />
            </Col>
          }
        </Row>
        <PaperTile 
          title={`${selectedFsIds.length} featureSet(s) selected`}
        />
        <CheckboxList 
          settings={[
            {
              key: 'mean',
              label: 'Mean',
              checked: mean
            },
            {
              key: 'mean10',
              label: 'Mean 10',
              checked: mean10
            },
            {
              key: 'median',
              label: 'Median',
              checked: median
            },
          ]}
          handleCheck={this.handleETACheck}
        />
        <TextField
          id="outlined-degree"
          label="Degree"
          value={degree}
          onChange={this.handleChange('degree')}
          margin="normal"
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            this.generateETA();
            // this.computeETAByML();
          }}
        >
          Generate ETA
        </Button>
        <ReviewETA 
          etas={generatedETAs}
          distanceToTime={distanceToTime}
          route={route}
          seq={seq}
        />
        <Row>
          {this.renderETAPerfCards()}
        </Row>
      </div>
    )
  }
}

export default SelectETA;