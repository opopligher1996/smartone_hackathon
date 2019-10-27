import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Block from '../Block';
import Minibus from '../../../../assets/img/minibus.png';
import BusStopIcon from '../../../../assets/img/bus-stop.svg';

class BusStopBadge extends Component {
  render() {
    return (
      <div className='minibus-badge'>
         <img src={BusStopIcon} className='minibus-icon' />
      </div>
    )
  }
}

export default BusStopBadge;
