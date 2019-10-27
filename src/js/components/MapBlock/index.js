import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Block from '../Block';

class MapBlock extends Component {
  state = {
    activeJourneyTraces: [],
  }

  componentDidMount() {
    this.getActiveTraces();
  }

  getActiveTraces = async () => {
    const response = await fetch('http://localhost:3008/dashboard/getActiveTraces')
    .then(response => response.json());
    this.setState({ 
      activeJourneyTraces: response.response
    });
  }

  renderActiveTraces = () => {
    const { activeJourneyTraces } = this.state;
    return activeJourneyTraces.map(trace => {
      const { records } = trace;
      return (
        <Polyline
          path={records.map(({ currentState }) => currentState.location)}
          strokeColor="#0000FF"
          strokeOpacity={0.8}
          strokeWeight={5} /> 
      )
    })
  }

  renderMinibusLocation = () => {
    const { activeJourneyTraces } = this.state;
    return activeJourneyTraces.map(trace => {
      const { records } = trace;
      const minibusLatestLocation = records[records.length - 1].currentState.location;
      return (
        <Marker
          key={'minibus-'+index}
          // onClick={() => this.select_minibus(minibus)}
          icon={{url: "/assets/img/minibus_icon.png"}}
          position={minibusLatestLocation}
        />
      )
    });
  }


  render() {
    return (
      <div className='map'>
        <Map
          styles={{ flex: 1, height: 300 }}
          google={this.props.google}
          zoom={15}
          initialCenter={{
            lat: 22.334255,
            lng: 114.209474
          }}
          // onClick={this.MapOnClick}
          >

          {this.renderActiveTraces()}
          {this.renderMinibusLocation()}
          
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(MapBlock);

