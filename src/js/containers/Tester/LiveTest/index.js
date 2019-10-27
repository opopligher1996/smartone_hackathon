import React, { Component } from 'react';
import { orderBy, findIndex } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import './styles.scss';
import RecordMapView from '../../../components/RecordMapView';
import CreateLiveTest from './CreateLiveTest';
import StartLiveTest from './StartLiveTest';
import { Check } from '@material-ui/icons';
import { Checkbox, TextField } from '@material-ui/core';

class LiveTest extends Component {

  state = {
    id: '',
    name: '',
    description: '',
    startingPoint: {},
    records: [],
    activeStep: 0,
    fakeETA: false,
    skipped: new Set(),
    route: '',
    fixLat: 0,
    fixLng: 0,
    fakeLatLng: false
  }

  componentDidMount() {
    this.setState({ id: +new Date() });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleCheck = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  updateRecords = recordId => event => {
    const val = event.target.value;
    let { records } = this.state;
    const index = findIndex(records, record => recordId === record.recordId);
    if(index !== -1)
      records[index].currentState.interval = val;
    this.setState({ records })
  }

  mapOnClick = async (mapProps, map, clickEvent) => {
    const { activeStep } = this.state;
    switch(activeStep) {
      case 0:
        return;
      case 1:
        this.createFootprint(clickEvent);
      break;
    }
  }

  createFootprint = async (clickEvent) => {
    const { records, id, route, fakeETA, fakeLatLng, fixLat, fixLng } = this.state;
    const { latLng } = clickEvent;
    const { lat, lng } = latLng;
    const location = fakeLatLng ? { lat: fixLat, lng: fixLng } : { lat: lat(), lng: lng() };
    console.log('createFootprint route', route);
    const response = await this.processMinibusAPI(`${fakeETA ? 'ETA' : 'TEST'}_${id}`, location, route);

    let record = {
      ...response.response,
      _id: response.response.recordId
    };

    if(!record.currentState.location)
      record.currentState.location = location;
    const newRecords = records.concat([record]);
    this.setState({ records: newRecords, pureCoordinates: newRecords.map(({ currentState }) => currentState.location) });
  }

  storeTest = () => {
    const { name, description, route, records } = this.state;
    fetch('http://localhost:3008/dashboard/storeTestCase', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        name,
        description,
        route,
        records,
        timestamp: +new Date()
      })
    });
  }

  processMinibusAPI = (license, location, route) => {
    const payload = {
      license,
      location: JSON.stringify(location),
      route,
      timestamp: +new Date(),
      batteryLeft: 101,
      speed: 0,
      provider: "gps",
      accuracy: 10
    }
    return fetch('http://localhost:7071/api/v2/record/addLocationRecord', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload), 
    }).then(response => response.json());
  }

  switchRoute = (route) => {
    console.log('route', route);
    this.setState({ route })
  }

  getSteps = () => {
    return ['Create live test', 'Start Live test', 'Review result'];
  }
  
  getStepContent = (step) => {
    switch (step) {
      case 0:
        return 'Input basic info';
      case 1:
        return 'Click on the map to simulate minibus location';
      case 2:
        return 'Review result';
      default:
        return 'Unknown step';
    }
  }

  isStepOptional = step => step === 1;

  handleNext = () => {
    const { activeStep } = this.state;
    let { skipped } = this.state;
    if (this.isStepSkipped(activeStep)) {
      skipped = new Set(skipped.values());
      skipped.delete(activeStep);
    }
    this.setState({
      activeStep: activeStep + 1,
      skipped,
    });
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleSkip = () => {
    const { activeStep } = this.state;
    if (!this.isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    this.setState(state => {
      const skipped = new Set(state.skipped.values());
      skipped.add(activeStep);
      return {
        activeStep: state.activeStep + 1,
        skipped,
      };
    });
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  isStepSkipped(step) {
    return this.state.skipped.has(step);
  }


  render() {
    const { id, name, description, startingPoint, activeStep, records, pureCoordinates, fakeETA, fixLat, fixLng, fakeLatLng } = this.state;
    const steps = this.getSteps();

    return (
      <div class='tester'>
        <Row>
          <Col sm={6}>
            <RecordMapView 
              records={records}
              pureCoordinates={pureCoordinates}
              enableOnClick={activeStep === 1}
              mapOnClick={this.mapOnClick}
              lineView
              // showCustomMarker={startingPoint}
              disableBounds
            />
          </Col>
          <Col sm={6}>
            <div>
              <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                  const props = {};
                  const labelProps = {};
                  if (this.isStepOptional(index)) {
                    labelProps.optional = <Typography variant="caption">Optional</Typography>;
                  }
                  if (this.isStepSkipped(index)) {
                    props.completed = false;
                  }
                  return (
                    <Step key={label} {...props}>
                      <StepLabel {...labelProps}>{label}</StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
              {
                activeStep === 0 && 
                <CreateLiveTest 
                  id={id}
                  handleChange={this.handleChange}
                  name={name}
                  data={records}
                  description={description}
                  switchRoute={this.switchRoute}
                  // startingPoint={startingPoint}
                />
              }
              {
                activeStep === 1 && 
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={fakeETA}
                        onChange={this.handleCheck('fakeETA')}
                        value="fakeETA"
                      />
                    }
                    label="Fake ETA"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={fakeLatLng}
                        onChange={this.handleCheck('fakeLatLng')}
                        value="fakeLatLng"
                      />
                    }
                    label="Fake LatLng"
                  />
                  <TextField
                    id="fix-lat"
                    label="Lat"
                    value={fixLat}
                    onChange={this.handleChange('fixLat')}
                    margin="normal"
                    variant="outlined"
                  />
                  <TextField
                    id="fix-lng"
                    label="Lng"
                    value={fixLng}
                    onChange={this.handleChange('fixLng')}
                    margin="normal"
                    variant="outlined"
                  />
                  <StartLiveTest 
                    records={records}
                    updateRecords={this.updateRecords}
                    disableEdit={true}
                  />
                </div>
              }
              {
                activeStep === 2 && 
                <div>
                  <StartLiveTest 
                    records={records}
                    updateRecords={this.updateRecords}
                    locked
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.storeTest}
                  >
                    Save Test
                  </Button>
                </div>
              }
              <div>
                {activeStep === steps.length ? (
                  <div>
                    <Typography>
                      All steps completed - you&apos;re finished
                    </Typography>
                    <Button onClick={this.handleReset}>
                      Reset
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Typography>{this.getStepContent(activeStep)}</Typography>
                    <div>
                      <Button
                        disabled={activeStep === 0}
                        onClick={this.handleBack}
                      >
                        Back
                      </Button>
                      {this.isStepOptional(activeStep) && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={this.handleSkip}
                        >
                          Skip
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={this.handleNext}
                      >
                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </Col>
        </Row>
      </div>
    )
  }
}

export default LiveTest;