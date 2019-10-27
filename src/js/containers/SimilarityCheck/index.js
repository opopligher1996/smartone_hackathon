import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Button, Dropdown } from 'react-bootstrap';

class SimilarityCheck extends Component {

  state = {
    trace: [],
    journeys: [],
    similarities: {},
    route: '11M',
    records: [],
    seq: 1,
    journeyId: null,
    pointView: false,
    simplifiedTrace: [],
    clusters: []
  }

  componentDidMount() {
    this.getJourneys();
  }

  getJourneys = async () => {
    const { route, seq, journeyId } = this.state;
    // console.log(`http://localhost:3002/api/v2/minibus/getJourney?journeySet=true&noRecord=true&route=${route}&seq=${seq}${journeyId !== null ? `&journeyId=${journeyId}` : ''}`);
    const data = await fetch(`http://localhost:3002/api/v2/minibus/getJourney?journeySet=true&noRecord=true&route=${route}&seq=${seq}${journeyId !== null ? `&journeyId=${journeyId}` : ''}`);
    const results = await data.json();
    const journeys = results.response;
    this.setState({ journeys });
    console.log('journeys', journeys);
  }

  renderJourneyMenuItems = () => {
    const { journeys } = this.state;
    const menuItems = journeys.map(({ _id: journeyId }) => <Dropdown.Item onClick={() => this.chooseJourney(journeyId)}>{journeyId}</Dropdown.Item>);
    return menuItems
  }

  chooseJourney = async (journeyId) => {
    const { route, seq } = this.state;
    this.getSimplifiedTrace(journeyId);
    this.getClusters(journeyId);
    const data = await fetch(`http://staging.socif.co:3002/api/v2/record/getRecord?journeySet=true&skipLongTrace=true&journeyId=${journeyId}`);
    const results = await data.json();
    const records = results.response;
    const similarityData = await fetch(`http://localhost:3004/api/v2/training/computeTraceSimilarity?route=${route}&seq=${seq}&journeyId=${journeyId}&journeySet=true`);
    const similarityResults = await similarityData.json();
    const similarities = similarityResults.response;
    this.setState({
      trace: records.map(({ currentState }) => currentState.location),
      records,
      similarities,
      journeyId
    });
  }

  getSimplifiedTrace = async (journeyId) => {
    const { route, seq } = this.state;
    const data = await fetch(`http://localhost:3004/api/v2/training/simplifyTrace?journeyId=${journeyId}&journeySet=true&route=${route}&seq=${seq}`);
    const results = await data.json();
    const trace = results.response;
    console.log('trace', trace);
    this.setState({ simplifiedTrace: trace });
  }

  getClusters = async (journeyId) => {
    const data = await fetch(`http://localhost:3004/api/v2/training/getClusters?journeyId=${journeyId}&journeySet=true`);
    const results = await data.json();
    const clusters = results.response;
    console.log('clusters', clusters);
    this.setState({ clusters });
  }

  updateJourney = () => {
    this.getJourneys();
  }

  pointView = (point) => {
    this.setState({ pointView: point });
  }

  renderClusterMarkers = () => {
    const { clusters } = this.state;
    return clusters.map((cluster, index) =>
      <Marker
      key={'cluster-'+index}
      position={cluster}
    />)
  }

  renderMarkers = () => {
    const { records } = this.state;
    console.log('records', records);
    const markers = records.map((record, index) => {
      if(index > 0) {
        return (
          <Marker
            key={'record-'+index}
            onClick={() => console.log(`Index: ${index} \n Interval: ${record.currentState.interval} \n Last Update: ${record.lastUpdate}`)}
            icon={{url: "src/js/containers/SimilarityCheck/footprint.png"}}
            position={{lat: record.currentState.location.lat , lng: record.currentState.location.lng}}
          />
        )
      } else {
        return (
          <Marker
            key={'record-'+index}
            onClick={() => console.log(`Index: ${index} \n Interval: ${record.currentState.interval} \n Last Update: ${record.lastUpdate}`)}
            icon={{url: "src/js/containers/SimilarityCheck/minibus_icon.png"}}
            position={{lat: record.currentState.location.lat , lng: record.currentState.location.lng}}
          />
        )
      }

    })
    return markers;
  }

  render() {
     const { similarities, trace, route, seq, journeyId, pointView, simplifiedTrace } = this.state;
     return (
       <div>
       <input value={route} onChange={(e) => {
         this.setState({ route: e.target.value });
       }} />
       <input value={seq} onChange={(e) => {
         this.setState({ seq: e.target.value });
       }} />
       <input value={journeyId} onChange={(e) => {
         this.setState({ journeyId: e.target.value });
       }} />
       <Button onClick={() => this.updateJourney()}>Update Journey</Button>
       <Dropdown>
         <Dropdown.Toggle variant="success" id="dropdown-basic">
           Choose Journey
         </Dropdown.Toggle>

         <Dropdown.Menu>
          {this.renderJourneyMenuItems()}
         </Dropdown.Menu>
       </Dropdown>
       <Dropdown>
         <Dropdown.Toggle variant="success" id="dropdown-basic">
           Choose View
         </Dropdown.Toggle>

         <Dropdown.Menu>
          <Dropdown.Item onClick={() => this.pointView(false)}>Line</Dropdown.Item>
          <Dropdown.Item onClick={() => this.pointView(true)}>Point</Dropdown.Item>
         </Dropdown.Menu>
       </Dropdown>
       {`Interval: ${similarities.interval}`}<br />
       {`Distance: ${similarities.distance}`}<br />
       {`Time: ${similarities.time}`}<br />
       <Map
         google={this.props.google}
         zoom={15}
         initialCenter={{
           lat: 22.334255,
           lng: 114.209474
         }}
         >
         {
           !pointView ?
           <Polyline
            path={trace}
            strokeColor="#0000FF"
            strokeOpacity={0.8}
            strokeWeight={5} /> :
            this.renderMarkers()
         }

         <Polyline
          path={simplifiedTrace}
          strokeColor="#FF0000"
          strokeOpacity={1}
          strokeWeight={6} />

          {this.renderClusterMarkers()}
       </Map>
       </div>
     )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(SimilarityCheck);
