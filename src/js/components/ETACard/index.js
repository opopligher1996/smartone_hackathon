import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './styles.scss';
import { Checkbox, FormControlLabel, Stepper, Step, StepLabel } from '@material-ui/core';
import PaperTile from '../PaperTile';

class ETACard extends Component {

  renderIntervals = () => {
    const { eta } = this.props;
    const { etaIntervalSet } = eta;

    return (
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
    )
  }
  
  render() {
    const { eta } = this.props;
    const { method, journeyTime } = eta; 

    return (
      <div className='eta-card-container'>
        <PaperTile 
          title={method}
          content={journeyTime}
        />
        <div className='stepper-container'>
          {this.renderIntervals()}
        </div>
      </div>
    )
  }
}

export default ETACard;