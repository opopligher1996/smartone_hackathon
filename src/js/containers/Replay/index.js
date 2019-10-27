import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Button, Dropdown } from 'react-bootstrap';
import './styles.scss';

class Replay extends Component {

  state = {
    total_result: null,
    route: null,
    switch_route:null,
    seq: 1,
    records: null,
    journey_id: '5c18f95b27e065695df5e7c3',
    lng:0,
    lat:0,
    records_count:0,
    start_run:false,
    intervals:null,
    switch_intervals:null,
    input_switch_intervals_route:'11',
    outRoute:0,
    input_journey_id:`5c18f95b27e065695df5e7c3`,
    input_out_route:null,
    input_startTime:1546160783282,
    input_endTime:1546162632114,
    input_license:'4104',
    input_intervals_route:'11M',
    input_intervalTime: 0,
    out_route:false,
    minibus_state:'Not change',
    lastUpdate:null,
    test_car_id:'ReplayCar',
    testing:false,
    eta:-5
  }

  getRecords = async (route) => {
    const {input_journey_id} = this.state
    const data = await fetch(`http://localhost:3002/api/v2/record/getRecord?journeyId=`+input_journey_id);
    const results = await data.json();
    var route = results.response[0].route
    var switch_route = null
    route=='11'?switch_route='11M':switch_route='11'
    this.setState({
      records:results.response,
      route:route,
      switch_route:switch_route,
      lat:results.response[0].currentState.location.lat,
      lng:results.response[0].currentState.location.lng,
      seq:results.response[0].currentState.seq,
      input_intervals_route:route,
      input_switch_intervals_route:switch_route
    })
    this.getIntervals()
    this.getSwitchIntervals()
  }

  getTimeRecords = async (state) => {
    var license = state.input_license
    var startTime = state.input_startTime
    var endTime = state.input_endTime

    const data = await fetch(`http://localhost:3002/api/v2/record/getTimeRecord?license=`+license+`&startTime=`+startTime+`&endTime=`+endTime);
    const results = await data.json();
    if(results.response.length == 0)
    {
      return this.setState({
            records:null,
          })
    }
    else {
      var route = results.response[0].route
      this.setState({
        records:results.response,
        records_count:0,
        route:route,
        lat:results.response[0].currentState.location.lat,
        lng:results.response[0].currentState.location.lng,
        seq:results.response[0].currentState.seq,
        lastUpdate:results.response[0].lastUpdate,
        input_intervals_route:route,
      })
      await this.getIntervals()
      // this.getSwitchIntervals()
    }
  }


  getIntervals = async (route) => {
    var {input_intervals_route, seq} = this.state
    const data = await fetch(`http://localhost:3002/api/v2/minibus/getIntervals?route=`+input_intervals_route+`&seq=`+seq);
    const results = await data.json();
    this.setState({
      intervals:results.response,
    })
  }

  getSwitchIntervals = async (route) => {
    var {route, seq} = this.state

    const data = await fetch(`http://localhost:3002/api/v2/minibus/getSwitchIntervals?route=`+route+`&seq=`+seq);
    const results = await data.json();
    this.setState({
      switch_intervals:results.response
    })

  }

  getSwitchInterval = async (route, seq) => {
    const data = await fetch(`http://localhost:3002/api/v2/minibus/getIntervals?route=`+route+`&seq=`+seq);
    const results = await data.json();
    return results.response
  }

  renderRecords = () => {
    const { records } = this.state;
    return records.map((record, index) => {
      const { lastUpdate, currentState } = record;
      const { location, passedStation, interval } = currentState;
      return (
        <Marker
           key={'record-'+index}

           icon={{url: "src/js/containers/RouteViewer/footprint.png"}}
           position={location}
           >

         </Marker>
      )
    })
  }

  renderIntervals = () => {
    const { intervals} = this.state;
    if(intervals == null)
      return null
    return intervals.map((interval, index) => {
      const { location, order } = interval;
      return (
        <Marker
           key={'interval-'+index}
           position={location}
           >
         </Marker>
      )
    })
  }

  renderSwitchIntervals = () => {
    const { switch_intervals } = this.state;
    if(switch_intervals == null)
      return null
    return switch_intervals.map((interval, index) => {
      const { location, order } = interval;
      return (
        <Marker
           key={'interval-'+index}
           position={location}
           icon={{url: "src/js/containers/Replay/switch_route_icon.png"}}
           >
         </Marker>
      )
    })
  }

  renderLines = () => {
    const { intervals } = this.state;
    if(intervals == null)
      return null
    const polyline = this.state.intervals.map(({ location }) => location);
    return (
      <Polyline
       path={polyline}
       strokeColor="#0000FF"
       strokeOpacity={0.8}
       strokeWeight={5} />
    )
  }

  renderStation = () => {
    const { intervals } = this.state;
    if(intervals == null)
      return null
    return intervals.map((interval, index) => {
      const { location, order } = interval;
      if(interval.isStation)
      {
        return (
          <Marker
            key={'interval-'+index}
            position={location}
          >
          </Marker>
        )
      }
    })

  }

  renderUserPosition = () => {
    console.log('renderUserPosition')
    const { user_lat, user_lng } = this.state;
    const location = {lat:user_lat,lng:user_lng}
      return (
        <Marker
           key={'UserPosition'}
           position={location}
           icon={{url: "src/js/containers/Replay/switch_route_icon.png"}}
           >
         </Marker>
      )
  }

  renderResultTable = () => {
    console.log('renderResultTable')
    var total_result = this.state.total_result
    if(total_result==null)
      return
    else{
      return total_result.map(result => {
        return <tr><td>{result.i}</td><td>{result.timeDifferent}</td></tr>
      })
    }
  }

  startRun = () =>{
    this.setState({start_run:true})
  }

  stopRun = () => {
    this.setState({start_run:false})
  }

  setInputJourneyId = (event) =>{
    this.setState({input_journey_id: event.target.value});
  }

  setInputOutRoute = (event) =>{
    this.setState({input_out_route: event.target.value});
  }

  setInputStartTime = (event) =>{
    this.setState({input_startTime: event.target.value});
  }

  setInputEndTime = (event) =>{
    this.setState({input_endTime: event.target.value});
  }

  setInputLicense = (event) =>{
    this.setState({input_license: event.target.value})
  }

  setInputIntervalsRoute = (event) =>{
    this.setState({input_intervals_route: event.target.value})
  }

  setInputIntervalTime = (event) => {
    this.setState({input_intervalTime: event.target.value})
  }

  resetRun = (state) => {
    this.getTimeRecords(state)
  }

  runMinibus = () =>{
    if(this.state.start_run==false)
      return
    var count = this.state.records_count
    var records = this.state.records
    var seq = records[count+1].currentState.seq
    var lat = records[count+1].currentState.location.lat
    var lng = records[count+1].currentState.location.lng
    var outRoute = this.state.outRoute
    var lastUpdate = records[count+1].lastUpdate

    if(this.state.start_run)
    {
      this.setState({
        seq:seq,
        lat:lat,
        lng:lng,
        records_count: count+1,
        lastUpdate:lastUpdate
      })
    }
  }

  //simReplayWithSaveData
  simRunMinibus = async (state) => {
    console.log('simRunMinibus')
    await this.getTimeRecords(state)
    this.simRun(state,0)
  }

  simRun = (state,i) => {
    var _this = this
    var records = _this.state.records
    if(i==records.length)
      return
    var l = "sim_1"
    var route = records[i].route
    var lastUpdate = records[i+1].lastUpdate
    var old_lastUpdate = records[i].lastUpdate
    var time_different = lastUpdate - old_lastUpdate
    var input_intervalTime = _this.state.input_intervalTime
    if(input_intervalTime!=0)
      time_different = input_intervalTime
    console.log(time_different)
    this.sleep(time_different).then(async() => {
      var seq = records[i+1].currentState.seq
      var lat = records[i+1].currentState.location.lat
      var lng = records[i+1].currentState.location.lng
      var route = records[i+1].route

      this.setState({
        seq:seq,
        lat:lat,
        lng:lng,
        records_count: i+1,
        lastUpdate:lastUpdate
      })
      await this.addLocationRecord(seq, route, lat, lng, lastUpdate, l)

      i++

      var user_lat = _this.state.user_lat
      var user_lng = _this.state.user_lng
      console.log(user_lat)
      console.log(user_lng)
      var eta = await this.getEta(route, l, user_lat, user_lng)
      console.log('eta = ')
      console.log(eta)
      _this.setState({
        eta:eta
      })
      this.simRun(state,i)
    })
  }

  addLocationRecord = (seq,route,lat,lng,lastUpdate, l) => {
    fetch('http://localhost:3002/api/v2/record/addLocationRecord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "location": "{\"lat\":"+lat+",\"lng\":"+lng+"}",
        "license": l,
        "route": route,
        "seq": seq,
        "timestamp": lastUpdate,
        "batteryLeft": "101"
      })
    })
  }


  sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  startSim = (state, i) => {
    console.log(i)
    var count = this.state.records_count
    var records = this.state.records
    var timeDifferent =  records[count+1].lastUpdate - this.state.lastUpdate
    var seq = records[count+1].currentState.seq
    var lat = records[count+1].currentState.location.lat
    var lng = records[count+1].currentState.location.lng
    var outRoute = this.state.outRoute
    var lastUpdate = records[count+1].lastUpdate
    this.setState({
      seq:seq,
      lat:lat,
      lng:lng,
      records_count: count+1,
      lastUpdate:lastUpdate
    })
  }

  getError = async (state) =>{
    await this.getTimeRecords(state)
    var intervals = this.state.intervals
    var records = this.state.records
    var stations = []
    var _this = this
    intervals.forEach(interval => {
      if(interval.isStation)
      {
        console.log('interval.isStation')
        var station_record = null
        var dis = 1000
        records.forEach(record => {
          var lat = record.currentState.location.lat
          var lng = record.currentState.location.lng
          var station_lat = interval.location.lat
          var station_lng = interval.location.lng
          if(_this.getDistance(lat, lng, station_lat, station_lng)<dis)
          {
            dis = _this.getDistance(lat, lng, station_lat, station_lng)
            station_record = record
          }
        })
        stations.push({interval:interval,record:station_record})
      }
    })
    var total_result = []
    this.startCalEtaDifferent(state,records,stations,0,total_result,0)
  }

  startCalEtaDifferent = async(state,records,stations,i, total_result,station_i) => {
    console.log('startCalEtaDifferent = '+i)
    if(i==records.length-1)
    {
      console.log('total_result')
      this.setState({total_result:total_result})
      console.log(total_result)
      return
    }
    var {lastUpdate,route, currentState} = records[i]
    var {seq,location} = currentState
    var {lat,lng} = location
    console.log('journeyId = '+currentState.journeyId)
    console.log('seq = '+currentState.seq)
    console.log('before simRunAddLocationRecord')
    var l = await this.simRunAddLocationRecord(lastUpdate,route,seq,lat,lng)
    var results = []
    var _this = this

    if(records[i] == stations[station_i].record)
    {
      console.log('enter')
      var total_different = 0
      var next_station = stations[station_i+1]
      var arrive_next_station_time = next_station.record.lastUpdate
      var eta = await _this.getStationEta(route, next_station, l);

      var stations_length = stations.length
      var last_station = stations[stations_length-1]
      var last_record = last_station.record
      var last_record_last_update = last_record.lastUpdate
      var last_record_eta = await _this.getStationEta(route, last_station, l);
      var last_time_different = (last_record_last_update - lastUpdate)/1000 - last_record_eta

      if(eta==-1)
        total_result.push({i:station_i,eta:eta})
      else if(eta==-5)
        total_result.push({i:station_i,eta:eta})
      else
      {
        var timeDifferent = (arrive_next_station_time-lastUpdate)/1000 - eta
        total_result.push({i:station_i,eta:eta,actualTime:(arrive_next_station_time-lastUpdate)/1000,timeDifferent:timeDifferent,last_time_different:last_time_different})
      }
      station_i++
    }

    i++
    this.startCalEtaDifferent(state,records,stations,i,total_result,station_i)
  }

  getStationEta = async(route,station,l) => {
    var record = station.record
    var stationLastUpdate = record.lastUpdate
    var lat = record.currentState.location.lat
    var lng = record.currentState.location.lng
    var seq = record.currentState.seq
    var eta = await this.getEta(route, l, lat, lng, seq)
    return eta
  }

  getEta = async(route, l, lat, lng, seq) => {
    // var data = await fetch('http://staging.socif.co:3002/api/v2/eta/getETA?lat='+lat+'&lng='+lng+'&getNearestStationIndex=true')
    // const results = await data.json();
    // var response = results.response
    // var selected_route = response.find(r => r.route == route && r.seq == seq)
    // // var eta_info = selected_route.etaInfo
    // var license = l
    // var car = eta_info.find(e => e.license == license)
    // if(car ===undefined || car == null)
    //   return -4
    // var eta = car.eta
    return 10
  }

  simRunAddLocationRecord = async(lastUpdate,route,seq,lat,lng) => {
      var license = "sim__1234"
      var callback = await fetch('http://localhost:3002/api/v2/record/addLocationRecord', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "location": "{\"lat\":"+lat+",\"lng\":"+lng+"}",
          "license": license,
          "route": route,
          "seq": seq,
          "timestamp": lastUpdate,
          "batteryLeft": "101"
        })
      })
      return license
  }

  checkValid = () =>{
    var intervals = this.state.intervals
    var out_route = this.state.out_route
    var lat2 = this.state.lat
    var lng2 = this.state.lng
    var outRoute = this.state.outRoute
    var is_outRoute = true
    var _this = this
    if(out_route)
    {
      this.checkStartPoint()
    }
    else if(intervals!=null && this.state.start_run)
    {
      var check_intervals = this.state.intervals
      check_intervals.map(interval =>{
        if(_this.getDistance(interval.location.lat,interval.location.lng,lat2,lng2)<0.2)
          is_outRoute = false
      })
      if(is_outRoute==true)
      {
        this.setState({
          outRoute: outRoute+1
        })
        if(outRoute==15)
          this.checkQuitOrSwitch()
      }
      else {
        this.setState({
          outRoute: 0
        })
      }
    }
  }

  checkQuitOrSwitch(){
    var switch_intervals = this.state.switch_intervals
    var _this = this
    var out_route = true
    switch_intervals.map(interval =>
    {
      let lat1 = interval.location.lat
      let lng1 = interval.location.lng
      let lat2 = _this.state.lat
      let lng2 = _this.state.lng
      if(_this.getDistance(lat1, lng1, lat2, lng2)<0.2)
        out_route = false
    })

    if(out_route)
    {
      this.setState({minibus_state:'Out Route'})
      this.setState({out_route:true})
    }
    else
    {
      this.setState({minibus_state:'Change Route'})
      this.switchRoute()
    }
    // this.stopRun()
  }

  switchRoute = () => {
    var intervals = this.state.intervals
    var intervals_route = this.state.intervals_route
    var temp_intervals = this.state.switch_intervals
    var temp_intervals_route = this.state.switch_intervals_route

    this.setState({
      switch_intervals:intervals,
      switch_intervals_route:intervals_route,
      intervals:temp_intervals,
      intervals_route:temp_intervals_route
    })
  }

  getDistance(lat1, lng1, lat2, lng2) {
    var R = 6371; // Radius of the earth in km
    var dLat = this.deg2rad(lat1-lat2);  // deg2rad below
    var dLon = this.deg2rad(lng1-lng2);
    var a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  MapOnClick = (t, map, coord) => {
    console.log('MapOnClick')
    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();
    var _this = this;
    this.setState({user_lat:lat})
    this.setState({user_lng:lng})
  }

  componentDidMount() {
    console.log('componentDidMount')
    this.interval = setInterval(() => this.checkValid(), 500);
    this.interval = setInterval(() => this.runMinibus(), 500);
  }

  render() {
    const records = this.state.records
    const lat = this.state.lat
    const lng = this.state.lng
    var polyline = {lat:22.1,lng:22.2}
    if(this.state.intervals!=null)
    {
      console.log('this.state.intervals')
      console.log(this.state.intervals)
      polyline = this.state.intervals.map(({ location }) => location);
    }
    return (
      <div>
        <div>
          Reference:<br/>
          <img className="reference_img" src={require('./11_1.png')}/>
          <img className="reference_img" src={require('./11_2.png')}/>
          <img className="reference_img" src={require('./11M1.png')}/>
          <img className="reference_img" src={require('./11M2.png')}/>
        </div>
        <div>
          <div>
            Replay for Time Range:
          </div>
          <form>
            <label>
              license:
              <input type="int" value={this.state.input_license} onChange={this.setInputLicense} />
            </label>
            <label>
              startTime:
              <input type="double" value={this.state.input_startTime} onChange={this.setInputStartTime} />
            </label>
            <label>
              endTime:
              <input type="double" value={this.state.input_endTime} onChange={this.setInputEndTime}/>
            </label>
            <label>
              IntervalTime:
              <input type="double" value={this.state.input_intervalTime} onChange={this.setInputIntervalTime}/>
            </label>
            <Button  onClick={() => this.getTimeRecords(this.state)}>Get Time Data</Button>
            <Button  onClick={() => this.simRunMinibus(this.state)}>SIM run</Button>
            <Button  onClick={() => this.getError(this.state)}>Get Error</Button>
          </form>
        </div>
        <div>
          <div>
            Replay for one journey:
          </div>
          <form>
            <div>
              <label>journey_id: <input type="double" value={this.state.input_journey_id} onChange={this.setInputJourneyId}/></label><br/>
              <Button onClick={() => this.getRecords()}>Get Data</Button>
            </div>
            <div>
              <label>intervals_route: <input type="double" value={this.state.input_intervals_route} onChange={this.setInputIntervalsRoute}/></label> ===========> <label>New Status:{this.state.minibus_state}</label><br/>
              <Button onClick={() => this.getIntervals()}>Get Interval</Button>
            </div>
          </form>
        </div>
        <div>
          <div>
            Get Switch Intervals
          </div>
        </div>
        <div>
          <div>
            Running the sim
          </div>
          <Button  onClick={() => this.startRun()}>Start Run</Button>
          <Button  onClick={() => this.stopRun()}>Stop Run</Button>
          <Button  onClick={() => this.resetRun(this.state)}>Reset Run</Button>
        </div>
        <div>
          route : {this.state.route}<br/>
          outRoute: {this.state.outRoute}<br/>
          seq: {this.state.seq}<br/>
          lastUpdate:{this.state.lastUpdate}<br/>
        </div>
        <div>
          ETA : {this.state.eta}
        </div>
        <div>
          <table>
            {this.renderResultTable()}
          </table>
        </div>
        <Map
          style={{'width':'80vw'}}
          google={this.props.google}
          zoom={15}
          initialCenter={{
            lat: 22.334255,
            lng: 114.209474
          }}
          onClick={this.MapOnClick}
        >
          <Marker
            key={'minibus-1'}
            icon={{url: "src/js/containers/RouteViewer/minibus_icon.png"}}
            position={{lat: lat , lng: lng}}
          />
          { this.renderLines()}
          { this.renderStation()}
          { this.renderSwitchIntervals() }
          { this.renderUserPosition() }
        </Map>

      </div>
    )
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCCaUGybfZSgG9RRNtjdrJ15ZmhEuB83Mw'
})(Replay);
