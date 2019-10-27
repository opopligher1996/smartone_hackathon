import React, { Component } from 'react';
import { orderBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import './styles.scss';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Typography from '@material-ui/core/Typography';
import SelectETA from './SelectETA';
import TestETA from './TestETA';

class ETATester extends Component {

  state = {
    selectedEtaId: null,
    eta: {},
    activeStep: 0,
    skipped: new Set(),
  }

  getSteps = () => {
    return ['Select ETA', 'Test ETA', 'Generate report'];
  }
  
  getStepContent = (step) => {
    switch (step) {
      case 0:
        return 'Select a ETA to test';
      case 1:
        return 'Test the ETA against journey';
      case 2:
        return 'Create Test Report';
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

  onSelectETA = (eta) => {
    this.setState({ eta, selectedEtaId: eta._id });
  }

  render() {
    const steps = this.getSteps();
    const { activeStep, selectedEtaId, eta } = this.state;

    return (
      <div className='tester'>
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
              <SelectETA 
                onSelectETA={this.onSelectETA}
                selectedEtaId={selectedEtaId}
                eta={eta}
              />
            }
            {
              activeStep === 1 && 
              <TestETA 
                eta={eta}
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
      </div>
    )
  }
}

export default ETATester;