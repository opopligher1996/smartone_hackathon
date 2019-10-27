import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Checkbox, FormControlLabel, Stepper, Step, StepLabel, Paper, Badge } from '@material-ui/core';
import PaperTile from '../PaperTile';

class ETAPerfCard extends Component {
  render() {
    const { name, meanLoss, maxLoss, rank, saveETAFunc } = this.props;

    return (
      <Paper>
        <Badge badgeContent={rank} color="primary" />
        <h5>{name}</h5>
        <p>Mean Loss: {meanLoss}</p>
        <p>Max Loss: {maxLoss}</p>
        <Button
          variant="contained"
          color="primary"
          onClick={saveETAFunc}
        >
          Store ETA
        </Button>
      </Paper>
    )
  }
}

export default ETAPerfCard;