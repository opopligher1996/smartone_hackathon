import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Block from '../Block';
import { Typography } from '@material-ui/core';

class LiveBadge extends Component {

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
    const { on } = this.state;
    const { online } = this.props;
    const onlineStyle = {
      backgroundColor: 'red',
      opacity: on ? 1 : 0
    };
    const offlineStyle = {
      backgroundColor: 'gray'
    }

    return (
      <div>
        <div className='live-badge'>
         <div className='container'>
            <div className='dot' style={online ? onlineStyle : offlineStyle}></div>
            <Typography variant="body1">
              { online ? '擠逼' : '人流稀少' }
            </Typography>
          </div>
        </div>
      </div>
    )
  }
}

export default LiveBadge;
