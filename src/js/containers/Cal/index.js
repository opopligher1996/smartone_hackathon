import React, { Component } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { forEach } from 'lodash';
import { filter } from 'lodash';

class Cal extends Component {

  state = {
    route: '11M',
    seq: 2,
    journeies: null,
    stations: null,
    results: [],
  }

  getError = async (state) => {
    var _this = this
    var count = 0
    var {route, seq} = this.state
    const data = await fetch(`http://staging.socif.co:3002/api/v2/minibus/getJourney?route=${route}&seq=${seq}`);
    const results = await data.json();
    var journeys = results.response.slice(250,270)
    var journeysRecords = []

    const tasks = journeys.map(journey =>
        fetch(`http://staging.socif.co:3002/api/v2/record/getRecord?journeyId=${journey._id}`)
        .then(res => res.json())
            .then(json => {
              return json
        })
    )

    await Promise.all(tasks).then(res => {
      res.forEach(r => {
        journeysRecords.push(r.response)
      })
    })

    const getIntervals_data = await fetch(`http://staging.socif.co:3002/api/v2/data/getIntervals?route=${route}&seq=${seq}`)
    const getIntervals_results = await getIntervals_data.json();
    const stations = filter(getIntervals_results.response, 'isStation');

    this.setState({
      journeys: journeys,
      stations: stations
    });

    const addRouteTasks = await journeysRecords.map(async (Records) => {
      var start_record = Records.find(interval => interval.currentState.interval>4)
      var {lastUpdate, route} = start_record
      var {seq, location, journeyId}  = start_record.currentState
      var {lat, lng} = location
      var license = 'Sim_'+journeyId
      await fetch('http://staging.socif.co:3002/api/v2/record/addLocationRecord', {
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
      }).then(response => _this.getETA(_this.state,stations,license,Records,start_record) );
    })


    // console.log(stations)
    // var last_station = stations[stations.length-1]
    // var eta = []
    // // stations.map(station => {
    // //
    // // })
    //
    // var lat = last_station.location.lat
    // var lng = last_station.location.lng
    // var eta_data = await fetch('http://staging.socif.co:3002/api/v2/eta/getETA?lat='+lat+'&lng='+lng+'&getNearestStationIndex=true')
    // var eta_results = await eta_data.json();
    //
    // console.log(eta_results)

  }

  // addroute => getETA
  getETA = async (state,stations,license,Records,start_record) => {
    var _this = this
    var last_station = stations[stations.length-1]
    var {route, seq} = this.state
    var eta = []
    var results = this.state.results
    var row = {license:license,result:[]}

    const Eta_tasks = stations.map(station =>
        fetch('http://staging.socif.co:3002/api/v2/eta/getETA?lat='+station.location.lat+'&lng='+station.location.lng+'&getNearestStationIndex=true')
        .then(res => res.json())
            .then(json => {
              return {response:json.response,station:station}
        })
    )

    var stationRecord = stations.map(s => {
      var min = Math.min(... Records.map(r => _this.getDistance(r.currentState.location.lat,r.currentState.location.lng,s.location.lat,s.location.lng)))
      console.log(min)
      if(min > 0.03)
        return null
      return Records.find(r => _this.getDistance(r.currentState.location.lat,r.currentState.location.lng,s.location.lat,s.location.lng) == min)
    })

    await Promise.all(Eta_tasks).then(res => {
      res.forEach(e => {
        var response = e.response
        var station_id = e.station.belongsStation
        var selectedRoute = response.find(res => res.route==route && res.seq==seq)
        var etaInfo = selectedRoute.etaInfo
        var selectedCar = etaInfo.find(info => info.license == license)
        var temp = null
        if(stationRecord[station_id]==null)
          temp = {stationID:station_id, eta:null, timeDifferent: null}
        else
          temp = _this.calEtaDiff(selectedCar, stationRecord[station_id], start_record,station_id)
        row.result.push(temp)
      })
    })

    results.push(row)
    this.setState({
      results: results
    })

    fetch(`http://staging.socif.co:3002/api/v2/training/deleteMinibusData`,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "license": license,
      })
    })
  }

  calEtaDiff(selectedCar, stationRecord, start_record,station_id) {
    var eta = selectedCar.eta
    var startTime = start_record.lastUpdate
    var endTime = stationRecord.lastUpdate
    var timeDifferent = -5
    if(eta == -1)
      timeDifferent = -1
    else if (eta!= -5) {
      timeDifferent = eta-(endTime-startTime)/1000
    }
    var result = {stationID:station_id, eta:eta, timeDifferent: timeDifferent}
    return result
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

  renderTable = (state) =>{
      console.log('renderResultTable')
      console.log(this.state.results)
      var results = this.state.results
      if(results.length == 0)
        return
      else{
        var temp = []
        var row = []
        return results.map(r => {
          return(
            <tr>
              <td>{r.license}</td>
              {r.result.map((res,index)=> <td>{res.timeDifferent}</td>)}
            </tr>
          )
        })
      }
  }

  renderTableHeader = (state) => {
    var results = this.state.results
    if(results.length == 0)
      return
    else{
      var result = results[0]
      return(
        <tr>
          <th>License</th>
          {result.result.map((res,index)=> <th>{index+1}</th>)}
        </tr>
      )
    }
  }

  render() {
    return (
      <div>
        <Button onClick={() => this.getError(this.state)}>Add Route</Button>
        <table>
          {this.renderTableHeader(this.state)}
          {this.renderTable(this.state)}
        </table>
      </div>
    )
  }
}

export default Cal;
