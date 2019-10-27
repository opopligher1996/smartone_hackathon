import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Block from '../Block';
import { Typography } from '@material-ui/core';

class BusStopLiveBadge extends Component {

  state = {
    on: false
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ on: !this.state.on });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }


  render() {
    const { busStop } = this.props;
    const { temperature, peopleNumber, fullLevel} = busStop
    var backgroundColor = 'red'

    if(fullLevel == '1')
      backgroundColor = 'green'

    const badgeStyle = {
      backgroundColor: backgroundColor,
      opacity: 1
    };

    const isFull = true

    return (
      <div>
        <div className='live-badge'>
         <div className='container'>
            <div className='dot' style={badgeStyle}></div>
            <Typography variant="body1">
              { fullLevel=='1' ? '人流稀少':'擠逼' }
            </Typography>
          </div>
        </div>
      </div>
    )
  }
}

export default BusStopLiveBadge;
