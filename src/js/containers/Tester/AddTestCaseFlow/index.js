import React, { Component } from 'react';
import { find } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import './styles.scss';
import SelectSample from './SelectSample';
import RecordEditor from './RecordEditor';
import CreateTest from './CreateTest';
import RecordMapView from '../../../components/RecordMapView';

class AddTestCaseFlow extends Component {

  state = {
    activeStep: 0,
    skipped: new Set(),
    trace: [],
    pureCoordinates: [],
    selectedJourneyId: '',
    selectedRecordId: 0,
  };

  componentDidMount() {
    this.bounds = new this.props.google.maps.LatLngBounds();
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.selectedJourneyId !== this.state.selectedJourneyId)
      this.setState({ selectedRecordId: 0 })
  }

  getSteps = () => {
    return ['Select Trace Sample', 'Set expected results', 'Create Test Case'];
  }
  
  getStepContent = (step) => {
    switch (step) {
      case 0:
        return 'Select a Trace Sample as the base of the Test Case';
      case 1:
        return 'Set the expected result of each location in the trace';
      case 2:
        return 'Create Test Case';
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

  setJourney = async (journeyId) => {
    this.setState({ selectedJourneyId: journeyId });
    const response = await fetch(`http://training.socif.co:3002/api/v2/record/getRecord?journeyId=${journeyId}&journeySet=true`)
    .then(response => response.json());
    const trace = response.response;
    this.setState({ 
      trace,
      pureCoordinates: trace.map(({ currentState }) => currentState.location),
    });
  }

  setRecord = async (recordId) => {
    this.setState({ 
      selectedRecordId: recordId,
    });
  }

  renderMarkers = () => {
    const { trace, selectedRecordId } = this.state;
    return trace.map((record, index) => {
      const { _id: recordId ,currentState } = record;
      const { location } = currentState;
      let params = selectedRecordId === recordId ? {} : { icon: {url: "../src/js/containers/RouteViewer/footprint.png"} };
      return (
        <Marker
          key={'location-'+index}
          position={location}
          {...params}
        />
      )
    });
  }

  zoomToRoute = () => {
    this.bounds = new this.props.google.maps.LatLngBounds();
    const { pureCoordinates } = this.state;
    for (var i = 0; i < pureCoordinates.length; i++) {
      this.bounds.extend(pureCoordinates[i]);
    }
  }

  zoomToPoint = () => {
    const { selectedRecordId } = this.state;
    console.log('selectedRecordId', selectedRecordId);
    this.bounds = new this.props.google.maps.LatLngBounds();
    const { trace } = this.state;
    const selectedRecord = find(trace, { _id: selectedRecordId });
    console.log('selectedRecord', selectedRecord);
    this.bounds.extend(selectedRecord.currentState.location);
  }

  render() {
    const { classes } = this.props;
    const steps = this.getSteps();
    const { activeStep, trace, selectedJourneyId, selectedRecordId, pureCoordinates } = this.state;
    const viewOptions = [
      'Please select view',
      'raw',
      'interval',
      'timeDiff',
      'speed',
      'lineView'
    ];
    console.log('activeStep', activeStep);
    console.log('trace', trace);
    
    if(selectedRecordId === 0)
      this.zoomToRoute();
    // else
    //   this.zoomToPoint();

    return (
      <Row className='tester'>
        <Col sm={6}>
          <div className='add-test-case-map'>
            <RecordMapView 
              options={viewOptions}
              pureCoordinates={pureCoordinates}
              records={trace}
            />
          </div>
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
              <div>
                <SelectSample 
                  selectedJourneyId={selectedJourneyId}
                  setJourneyFunc={this.setJourney}
                />
                <RecordEditor 
                  records={trace}
                  selectedRecordId={selectedRecordId}
                  setRecordFunc={this.setRecord}
                />
              </div>
            }
            {
              activeStep === 1 && 
              <RecordEditor 
                records={trace}
                selectedRecordId={selectedRecordId}
                setRecordFunc={this.setRecord}
              />
            }
            {
              activeStep === 2 && 
              <CreateTest 
                records={trace}
              />
            }
            <div>
              {activeStep === steps.length ? (
                <div>
                  <Typography>
                    All steps completed - you&apos;re finished
                  </Typography>
                  <Button onClick={this.handleReset} className={classes.button}>
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
        
      );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(AddTestCaseFlow);