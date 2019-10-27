import React, { Component } from 'react';
// import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Marker, Polyline } from "react-google-maps";
import { Button, Dropdown } from 'react-bootstrap';
import RoutePerformance from '../RoutePerformance';
import { filter } from 'lodash';
import './styles.scss';
import './table_styles.scss'
import { Checkbox, TextField } from '@material-ui/core';
import RouteEditor from '../RouteEditor';
import MinibusActive from './minibus_icon.png';
import MinibusInActive from './minibus_inactive_icon.png';
import ChenMap from '../../components/ChenMap';

class RouteViewer extends Component {

    state = {
      intervals: [],
      selected_minibus: null,
      stations: [],
      selectedStation: {},
      selectedInterval: {},
      selectedRoute: null,
      selectedSeq: null,
      minibuses: [],
      journeys: [],
      records: [],
      lineView: false,
      insertMode: false,
      insertFromIndex: 0,
      insertPosition: null,
      insertMode_route: null,
      insertMode_seq: null,
      Status: null,
      stopName:null,
      stopNumber:null,
      showPanel: false,
      showRealMinibusOnly: false,
      selected_journey: null,
      newRoute: {
        name: '', 
        seq: null
      }
    }

  componentDidUpdate(prevProps, prevState) {
    if(prevState.selectedRoute !== this.state.selectedRoute ||
      prevState.selectedSeq !== this.state.selectedSeq) {
        this.getJourneys();
      }
  }

  chooseRoute = async (route, seq) => {
    const data = await fetch(`http://localhost:7071/api/v2/data/getIntervals?route=${route}&seq=${seq}`);
    const results = await data.json();
    const stations = filter(results.response, 'isStation');
    this.setState({
      selectedRoute: route,
      selectedSeq: seq,
      insertMode_seq: seq,
      insertMode_route: route,
      intervals: results.response.length ? results.response[0].intervals : [],
      stations
    });
  }

  getFootprint = async (journeyId) => {
    console.log('journeyId', journeyId);
    const data = await fetch(`http://localhost:7071/api/v2/record/getRecord?journeyId=${journeyId}`);
    const results = await data.json();
    this.setState({ records: results.response,selected_journey:journeyId });
  }

  lineView = line => {
    this.setState({ lineView: line })
  }

  getAllMinibuses = async () => {
    const { showRealMinibusOnly } = this.state;
    const data = await fetch(`http://localhost:3002/api/v2/minibus/getAllMinibuses${showRealMinibusOnly ? '?realOnly=true' : ''}`);
    const results = await data.json();
    this.setState({ minibuses: results.response });
  }

  getJourneys = async () => {
    const { selectedRoute: route, selectedSeq: seq } = this.state;
    const data = await fetch(`http://localhost:7071/api/v2/minibus/getJourney?route=${route}&seq=${seq}`);
    const results = await data.json();
    this.setState({ journeys: results.response });
  }

  select_minibus(minibus){
    this.setState({ selected_minibus: minibus});
  }

  mapOnClick = (t, map, coord) => {
    const { latLng } = coord;
    const { insertMode, insertFromIndex } = this.state;
    let { intervals } = this.state;
    const lat = latLng.lat();
    const lng = latLng.lng();
    var _this = this;
    console.log('Start debug')
    if(insertMode){
      intervals.splice(insertFromIndex + 1, 0, {
        order: -1,
        location: { lat, lng },
        isStation: false,
        name: '',
        critical: false,
        startReturning: false,
        belongsStation: -1,
      });
      this.setState({ intervals, insertFromIndex: insertFromIndex + 1 });
    }
  }

  CreateNewInterval(belongsStation,isStation,location,name,order,routeid){
    var new_interval = {
                          'order':order,
                          'belongsStation':belongsStation,
                          'isStation':isStation,
                          'location':location,
                          'name':name,
                          'routeid':routeid
                        }
    return new_interval
  }

  // UpdatedIntervals = async () => {
  //   console.log('UpdatedIntervals')
  //   var message =
  //   await fetch("http://localhost:3002/api/v2/minibus/updateIntervals",
  //   {
  //       method: "POST",
  //       headers: {
  //         'Accept': 'application/json',
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({route: this.state.insertMode_route, seq: this.state.insertMode_seq, intervals:this.state.intervals})
  //   })
  //   this.setState({Status:message.statusText})
  // }

  saveRoute = async () => {
    const { newRoute, intervals } = this.state;
    let belongsStation = -1;
    const updatedIntervals = intervals.map((interval, index) => {
      const isStation = interval.name ? true : false;
      if(isStation)
        belongsStation++;
      let payload = {
        ...interval,
        order: index,
        isStation: interval.name ? true : false,
        belongsStation
      } 
      return payload;
    });
    const routeObj = {
      route: newRoute.name,
      seq: newRoute.seq,
      intervals: updatedIntervals
    };
    console.log('route to save', routeObj);
    const response = await fetch("http://localhost:3002/api/v2/minibus/updateIntervals",
    {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(routeObj)
    }).then(res => res.json());
    console.log('response', response)
  }

  InsertStation(interval){
    this.setState({ insertMode: true});
    this.setState({insertPosition:interval.interval.order})
  }

  DeleteStation(selected_interval){
    var intervals = this.state.intervals
    var order = selected_interval.interval.order
    var updated_intervals = []
    var _this = this
    intervals.map(function(interval,index){
      if(index<order)
        updated_intervals.push(interval)
      else if(index>order)
      {
        var location = {'lat':interval.location.lat,'lng':interval.location.lng}
        var newMarker = _this.CreateNewInterval(intervals[index].belongsStation,intervals[index].isStation,location,intervals[index].name,index-1,intervals[index].routeid)
        updated_intervals.push(newMarker)
      }
    })
    this.setState({intervals:updated_intervals})
  }

  IsStation(selected_interval){
    var set_station = selected_interval.interval.isStation
    var order = selected_interval.interval.order
    var intervals = this.state.intervals
    var belong_count = -1
    var updated_intervals = []
    intervals.map(function(interval,index){
      if(order == index)
        interval.isStation = !interval.isStation

      if(interval.isStation)
        belong_count++
      interval.belongsStation = belong_count
      updated_intervals.push(interval)
    })
    this.setState({intervals:updated_intervals})
  }

  componentDidMount() {
    // this.interval = setInterval(() => this.getAllMinibuses(), 2000);
  }

  onMouseoverInterval = (interval, index) => {
    const { selectedInterval } = this.state;
    if(selectedInterval.order !== interval.order)
      this.setState({ selectedInterval: interval });
  }

  onMouseoverFootprint = (record, index) => {
    const { lastUpdate, currentState } = record;
    const { provider, accuracy, interval, intervalTimeDifference, stationTimeDifference } = currentState;
    console.log(`Order: ${index} \n Time: ${new Date(lastUpdate)} \n Current Interval: ${interval} \n Provider: ${provider} \n Accuracy: ${accuracy} \n Interval Time Difference: ${intervalTimeDifference} \n Station Time Difference: ${stationTimeDifference}`);
  }

  renderStations = () => {
    var stations = []
    var intervals = this.state.intervals;
    intervals.map(interval =>
    {
      interval.isStation?stations.push(interval):null
    })
    return stations.map((station, index) => {
      const { location, order } = station;
      return (
        <Marker
           key={'station-'+index}
           onMouseover={() => this.onMouseoverInterval(station)}
           title={`Order: ${order}`}
           id={'station-'+index}
           position={location}
           >
           <p>Order: {order}</p>
         </Marker>
      )
    })
  }

  renderIntervals = () => {
    const { intervals } = this.state;
    return intervals.map((interval, index) => {
      const { location, order } = interval;
      return (
        <Marker
           key={'interval-'+index}
           position={location}
           onMouseOver={() => this.onMouseoverInterval(interval, index)}
           />
      )
    })
  }

  renderRecords = () => {
    const { records } = this.state;
    return records.map((record, index) => {
      const { lastUpdate, currentState } = record;
      const { location, passedStation, interval } = currentState;
      return (
        <Marker
           key={'record-'+index}
           onMouseover={() => this.onMouseoverFootprint(record, index)}
           icon={{url: "src/js/containers/RouteViewer/footprint.png"}}
           position={location}
           name={`Order: ${index}`}
           >
           <div className='point-here' position={location} style={{ backgroundColor: 'red', width: 15, height: 15 }} />
         </Marker>
      )
    })
  }

  ChangeStopName(){
    var stopName = this.state.stopName
    var stopNumber = this.state.stopNumber
    var intervals = this.state.intervals
    var updated_intervals = []
    intervals.map(function(interval,index){
      if(index==stopNumber)
        interval.name = stopName
      updated_intervals.push(interval)
    })
    this.setState({intervals:updated_intervals})
  }

  updateInputValue(evt) {
    this.setState({
      stopName: evt.target.value
    });
  }

  updateIntValue(evt) {
    this.setState({
      stopNumber: evt.target.value
    });
  }

  updateNewRoute = (key) => event => {
    let { newRoute } = this.state;
    newRoute[key] = event.target.value;
    this.setState({ newRoute });
  }

  updateInterval = (field, index, type = 'val') => event => {
    const val = event.target.value;
    const checked = event.target.checked;
    let { intervals } = this.state;
    intervals[index][field] = type === 'val' ? val : checked;
    this.setState({ intervals });
  }

  insertInterval = (index) => {
    this.setState({ insertMode: true, insertFromIndex: index })
  }

  deleteInterval = (index) => {
    const { intervals } = this.state;
    this.setState({ intervals: intervals.filter((interval, i) => i !== index) });
  }

  stopInsert = () => {
    this.setState({ insertMode: false });
  }

  addNewRoute = () => {
    this.setState({ insertMode: true, intervals: [] });
  }

  render() {
    const intervals = this.state.intervals;
    const minibuses = this.state.minibuses;
    const selected_minibus = this.state.selected_minibus;
    const polyline = this.state.intervals.map(({ location }) => location);
    const { selectedInterval, lineView, journeys, records, showPanel, insertFromIndex, insertMode, newRoute } = this.state;
    return (
      <div>
        <RoutePerformance />
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Choose Route
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => this.chooseRoute('11', 1)}>{'11 (彩虹->坑口) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11', 2)}>{'11 (坑口->彩虹) seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11A', 1)}>{'11A (坑口村->坑口站) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11A', 2)}>{'11A (坑口站->坑口村) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11B', 1)}>{'11B1 (彩虹->北閘) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11B', 2)}>{'11B1 (北閘->彩虹) seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11B', 1)}>{'11B2 (彩虹->南閘) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11B', 2)}>{'11B2 (南閘->彩虹) seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11M', 1)}>{'11M (坑口->北閘) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11M', 2)}>{'11M (北閘->坑口) seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11MS', 1)}>{'11MS (坑口->傲龍) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11MS', 2)}>{'11MS (傲龍->坑口) seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11S', 1)}>{'11S (彩虹->寶琳) seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11S', 2)}>{'11S (寶琳->彩虹) seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('12', 1)}>{'12 seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('12', 2)}>{'12 seq 2'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('12A', 1)}>{'12A seq 1'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('8s', 1)}>{'Testing'}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Choose View
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => this.lineView(true)}>線</Dropdown.Item>
            <Dropdown.Item onClick={() => this.lineView(false)}>點</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Choose Journey
          </Dropdown.Toggle>

          <Dropdown.Menu>
          {
            journeys &&
            journeys.map(journey => <Dropdown.Item onClick={() => this.getFootprint(journey._id)}>{journey._id}</Dropdown.Item>)
          }
          </Dropdown.Menu>
        </Dropdown>

        <div>
          Journey Status:<br/>
          selected_journey: {this.state.selected_journey}<br/><br/>

          Minibuse Status:<br/>
          License : {selected_minibus?selected_minibus.license:'Please Select'}<br/>
          Route : {selected_minibus?selected_minibus.route:'Please Select'}<br/>
          Seq : {selected_minibus?selected_minibus.currentState.seq:'Please Select'}<br/>
          Interval : {selected_minibus?selected_minibus.currentState.interval:'Please Select'}<br/>
          PassedStation : {selected_minibus?selected_minibus.currentState.passedStation:'Please Select'}<br/>
          MinibusLocation : {selected_minibus?'Lat : '+selected_minibus.currentState.location.lat+"  Lng : "+selected_minibus.currentState.location.lng:'Please Select'}<br/>
          LastUpdate : {selected_minibus?selected_minibus.lastUpdate:'Please Select'}<br/>
        </div>
        <div>
          Show Edit panel:
          <input type="checkbox" checked={this.state.showPanel} onChange={() => this.setState(prevState => ({ showPanel: !prevState.showPanel }))} className="filled-in" id="filled-in-box"/>
        </div>
        <div>
          Show Real Minibus only:
          <input type="checkbox" checked={this.state.showRealMinibusOnly} onChange={() => this.setState(prevState => ({ showRealMinibusOnly: !prevState.showRealMinibusOnly }))} className="filled-in" id="filled-in-box"/>
        </div>
        <div className='tool-container'>
        <div className={'map'}>
          <div className='info-box'>
            {!!selectedInterval.name && `Name: ${selectedInterval.name}`}<br />
            Order: {selectedInterval.order}
          </div>

          <ChenMap 
            containerElement={<div style={{ height: `600px`, width: '100%' }} />}
            mapElement={<div style={{ height: `100%`, width: '100%' }} />}
          >
            {minibuses.map((minibus, index) => minibus.active?(
              <Marker
                key={'minibus-'+index}
                onClick={() => this.select_minibus(minibus)}
                icon={MinibusActive}
                position={{lat: minibus.currentState.location.lat , lng: minibus.currentState.location.lng}}
              />
            ):(
              <Marker
                key={'minibus-'+index}
                onClick={() => this.select_minibus(minibus)}
                icon={MinibusInActive}
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

             {this.renderStations()}
          </ChenMap>
            
        </div>
        <Button 
          variant="warning"
          onClick={this.addNewRoute}>Add New Route</Button>
        <TextField
          id={`new-route-name`}
          label="New route name"
          value={newRoute.name}
          onChange={this.updateNewRoute('name')}
          margin="normal"
        />
        <TextField
          id={`new-route-seq`}
          label="New route seq"
          value={newRoute.seq}
          onChange={this.updateNewRoute('seq')}
          margin="normal"
        />
        <RouteEditor 
          show={showPanel}
          intervals={intervals}
          insertMode={insertMode}
          stopInsert={this.stopInsert}
          saveRoute={this.saveRoute}
          insertFromIndex={insertFromIndex}
          updateInterval={this.updateInterval}
          deleteInterval={this.deleteInterval}
          insertInterval={this.insertInterval}
        />
        </div>
      </div>
    )
  }
}

export default RouteViewer;
