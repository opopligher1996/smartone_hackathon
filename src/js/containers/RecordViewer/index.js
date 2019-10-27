import React, { Component } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { filter } from 'lodash';
import Footprint from './footprint.png';

class RecordViewer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: decodeURIComponent(props.match.params.query || ''),
      records: [],
      originalRecords: [],
      loaded: false
    }
  }

  componentDidMount() {
    if(this.state.query !== '')
      this.getFootprint();
  }

  getFootprint = async () => {
    const { query } = this.state;
    const data = await fetch(query);
    const results = await data.json();
    const records = results.response.map(({ currentState }) => {
      return currentState.location || { lat: 0, lng: 0};
    });
    this.setState({ originalRecords: results.response, records, loaded: true });
    this.props.history.push(`/rv/${encodeURIComponent(query)}`);
  }

  renderRecords = () => {
    const { records, originalRecords } = this.state;
    return records.map((location, index) => {
      return (
        <Marker
          key={'location-'+index}
          icon={{url: Footprint}}
          position={{lat: location.lat , lng: location.lng}}
          onMouseover={() => console.log('originalRecords', originalRecords[index])}
        />
      )
    })
  }

  render() {
    const { mapOnClick } = this.props;
    const { query, records, loaded } = this.state;
    let bounds = new this.props.google.maps.LatLngBounds();
    for (var i = 0; i < records.length; i++) {
      bounds.extend(records[i]);
    }
    return (
      <div>
      <input value={query} onChange={(e) => {
         this.setState({ query: e.target.value });
       }} />
       <Button onClick={() => this.getFootprint()}>Get Records</Button>
      <Map
            google={this.props.google}
            zoom={15}
            initialCenter={{
              lat: 22.334255,
              lng: 114.209474
            }}
            bounds={bounds}
            >

            {
              records.length &&
              this.renderRecords()
            }

            {/* {minibuses.map((minibus, index) => minibus.active?(
              <Marker
                key={'minibus-'+index}
                onClick={() => this.select_minibus(minibus)}
                icon={{url: "src/js/containers/RouteViewer/minibus_icon.png"}}
                position={{lat: minibus.currentState.location.lat , lng: minibus.currentState.location.lng}}
              />
            ):(
              <Marker
                key={'minibus-'+index}
                onClick={() => this.select_minibus(minibus)}
                icon={{url: "src/js/containers/RouteViewer/minibus_inactive_icon.png"}}
                position={{lat: minibus.currentState.location.lat , lng: minibus.currentState.location.lng}}
              />
            )
            )}

            {
              records &&
              this.renderRecords()
            }

            {
              lineView ?
              <Polyline
               path={polyline}
               strokeColor="#0000FF"
               strokeOpacity={0.8}
               strokeWeight={5} /> :

               this.renderIntervals()
            }

             {this.renderStations()} */}
          </Map>
          { loaded && <div id="records-loaded" /> }
          </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(RecordViewer);