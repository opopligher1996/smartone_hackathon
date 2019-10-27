import React, { Component } from 'react';
import { orderBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import './styles.scss';
import TableList from '../../components/TableList';
import ListMenu from '../../components/ListMenu';

class RecordMapView extends Component {
  
  constructor(props) {
    super(props);
    const markerTemplate = {
      path: this.props.google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: 'white',
      fillOpacity: 0.8,
      strokeColor: 'black',
      strokeWeight: 1
    }
    this.defaultOptions = [
      'Please select view',
      'raw',
      'interval',
      'timeDiff',
      'speed',
      'lineView'
    ];
    this.state = {
      view: 'interval',
      markerType: {
        normal: markerTemplate,
        speed: {
          high: {
            ...markerTemplate,
            path: this.props.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillColor: 'red'
          },
          mid: {
            ...markerTemplate,
            path: this.props.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillColor: 'yellow'
          },
          low: {
            ...markerTemplate,
            path: this.props.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            fillColor: 'green'
          },
        },
  
      }
    }
  }

  renderMarkers = () => {
    const { view, markerType } = this.state;
    const { records = [] } = this.props;
    return records.map((record, index) => {
      const { currentState, status = 0 } = record;
      const { location, interval, speed } = currentState;
      let markerIcon;
      if(view !== 'speed') {
        markerIcon = markerType.normal;
      } else {
        if(speed < 5)
          markerIcon = markerType.speed.low;
        if(speed > 5 && speed < 15)
          markerIcon = markerType.speed.mid;
        if(speed > 15)
          markerIcon = markerType.speed.high;
      }

      if(status === 1)
        markerIcon.fillColor = "blue"
      if(status === 2)
        markerIcon.fillColor = "green"
      if(status === 3)
        markerIcon.fillColor = "red"

      const label = {
        text: `${currentState[view] || ' '}`,
        fontFamily: "Arial",
        fontSize: "14px",
      };

      return (
        <Marker
          key={`location-${index}-${currentState[view]}`}
          position={location}
          label={view === 'interval' ? label : {}}
          icon={markerIcon}
        />
      )
    });
  }

  renderPolyline = () => {
    const { pureCoordinates } = this.props;
    return (
      <Polyline
        path={pureCoordinates}
        strokeColor="#0000FF"
        strokeOpacity={0.8}
        strokeWeight={2} />
    )
  }

  switchView = (index) => {
    const { options = this.defaultOptions } = this.props;
    this.setState({ view: options[index] })
  }

  render() {
    const { options = this.defaultOptions, pureCoordinates = [{
      lat: 22.334255,
      lng: 114.209474
    }], records, mapOnClick, showCustomMarker, disableBounds, lineView } = this.props;
    const { view } = this.state;
    
    const bounds = new this.props.google.maps.LatLngBounds();
    let params;
    if(!disableBounds) {
      for (var i = 0; i < pureCoordinates.length; i++) {
        bounds.extend(pureCoordinates[i]);
      }
      params = { bounds };
    }
    
    return (
      <div className='map'>
        <ListMenu 
          label={'Select View'}
          options={options}
          selectMenuItem={(index) => this.switchView(index)}
        />
        <Map
          google={this.props.google}
          zoom={15}
          initialCenter={{
            lat: 22.334255,
            lng: 114.209474
          }}
          {...params}
          onClick={mapOnClick}
          >
          {this.renderMarkers()}
          { (lineView || view === 'lineView') && this.renderPolyline() }
          {showCustomMarker && <Marker position={showCustomMarker}/>}
        </Map>
      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(RecordMapView);