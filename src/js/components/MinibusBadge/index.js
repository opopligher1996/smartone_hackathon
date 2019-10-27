import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Block from '../Block';
import Minibus from '../../../../assets/img/minibus.png';

class MinibusBadge extends Component {
  render() {
    const { license } = this.props;
    return (
      <div className='minibus-badge'>
         <img src={Minibus} className='minibus-icon' />
         <div className='license-plate'>{license}</div>
      </div>
    )
  }
}

export default MinibusBadge;