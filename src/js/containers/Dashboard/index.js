import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import React, { Component } from 'react';
import { GoogleMap, Marker, withGoogleMap, OverlayView, Polyline } from "react-google-maps";
import { find, orderBy, filter } from "lodash";
const { MarkerWithLabel } = require("react-google-maps/lib/components/addons/MarkerWithLabel");
import './styles.scss';
import BusActive from '../../../../assets/img/bus.png';
import MinibusInActive from '../../../../assets/img/minibus_icon_inactive.png';
import BusStopIcon from '../../../../assets/img/bus-stop.svg'
import OpTopBar from '../../components/OpTopBar';
import ChenMap from '../../components/ChenMap';
import { TableRow, TableCell, FormControl, InputLabel, Select, MenuItem, Typography, TextField, InputAdornment } from '@material-ui/core';
import MinibusDetail from './MinibusDetail';
import BusStopDetail from './BusStopDetail';
import MinibusCard from '../../components/MinibusCard';
import BusStopCard from '../../components/BusStopCard';
import NativeListMenu from '../../components/NativeListMenu';
import CheckboxList from '../../components/CheckboxList';
import SearchIcon from '@material-ui/icons/Search';

const getPixelPositionOffset = (width, height) => ({
  x: -(width / 2),
  y: -(height / 2),
})

class Dashboard extends Component {

  state = {
    buses: [
      {
        location: {lat: 22.335572, lng: 114.241900}
      },
      {
        location: {lat: 22.342717, lng: 114.255633}
      },
      {
        location: {lat: 22.334460, lng: 114.210142}
      },
      {
        location: {lat: 22.326203, lng: 114.251513}
      },
      {
        location: {lat: 22.322710, lng: 114.268679}
      },
      {
        location: {lat: 22.330491, lng: 114.262499}
      },
      {
        location: {lat: 22.339561, lng: 114.259342}
      }
    ],
    busStops: [],
    minibuses: [],
    licenseIDPair: [],
    activeMarker: null,
    status: 0,
    showLicense: false,
    filterOutRoute: false,
    filterIsIdle: false,
    route: null,
    gpsMode: null,
    filterLowBattery: false,
    seq: 0,
    keyword: '',
    selectedBusStop: null
  }

  componentDidMount() {
    this.checkRole()
    this.getBusStop()
  }

  checkRole = () => {
    const user = this.props.user
    !user?this.props.history.push('/login'):null
  }

  getBusStop = async () => {
    const busStopRecords = [
          {
            'id':0,
            'name':'鑽石山地鐵站',
            'temperature':30,
            'peopleNumber':20,
            'frequentTravelers':15,
            'fullLevel':2,
            'location':{
              'lat':22.340175,
              'lng':114.200950
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 500,
                'predictPeopleCount': 480
              },
              {

                'actualPeopleCount': 300,
                'predictPeopleCount': 340
              },
              {

                'actualPeopleCount': 110,
                'predictPeopleCount': 120
              },
              {

                'actualPeopleCount': 50,
                'predictPeopleCount': 20
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          },
          {
            'id':1,
            'name':'彩虹錦雲樓',
            'temperature':35,
            'peopleNumber':5,
            'frequentTravelers':0,
            'fullLevel':1,
            'location':{
              'lat':22.337185,
              'lng':114.204537
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 110,
                'predictPeopleCount': 120
              },
              {

                'actualPeopleCount': 90,
                'predictPeopleCount': 70
              },
              {

                'actualPeopleCount': 50,
                'predictPeopleCount': 60
              },
              {

                'actualPeopleCount': 20,
                'predictPeopleCount': 20
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          },
          {
            'id':2,
            'name':'清水灣龍窩村',
            'temperature':29,
            'peopleNumber':10,
            'frequentTravelers':20,
            'fullLevel':1,
            'location':{
              'lat':22.333301,
              'lng':114.234829
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 40,
                'predictPeopleCount': 50
              },
              {

                'actualPeopleCount': 30,
                'predictPeopleCount': 20
              },
              {

                'actualPeopleCount': 10,
                'predictPeopleCount': 10
              },
              {

                'actualPeopleCount': 10,
                'predictPeopleCount': 20
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          },
          {
            'id':3,
            'name':'白石窩',
            'temperature':32,
            'peopleNumber':5,
            'frequentTravelers':10,
            'fullLevel':1,
            'location':{
              'lat':22.335955,
              'lng':114.241677
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 30,
                'predictPeopleCount': 20
              },
              {

                'actualPeopleCount': 20,
                'predictPeopleCount': 20
              },
              {

                'actualPeopleCount': 10,
                'predictPeopleCount': 20
              },
              {

                'actualPeopleCount': 20,
                'predictPeopleCount': 20
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          },
          {
            'id':4,
            'name':'香港科技大學(南)',
            'temperature':30,
            'peopleNumber':40,
            'frequentTravelers':45,
            'fullLevel':3,
            'location':{
              'lat':22.333376,
              'lng':114.262680
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 30,
                'predictPeopleCount': 45
              },
              {

                'actualPeopleCount': 20,
                'predictPeopleCount': 20
              },
              {

                'actualPeopleCount': 10,
                'predictPeopleCount': 10
              },
              {
                'actualPeopleCount': 10,
                'predictPeopleCount': 10
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          },
          {
            'id':5,
            'name':'坑口(北)巴士總站',
            'temperature':40,
            'peopleNumber':20,
            'frequentTravelers':15,
            'fullLevel':2,
            'location':{
              'lat':22.317761,
              'lng':114.268676
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 110,
                'predictPeopleCount': 120
              },
              {

                'actualPeopleCount': 70,
                'predictPeopleCount': 80
              },
              {

                'actualPeopleCount': 50,
                'predictPeopleCount': 30
              },
              {

                'actualPeopleCount': 30,
                'predictPeopleCount': 40
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          },
          {
            'id':6,
            'name':'寶林公共運輸交匯處',
            'temperature':36,
            'peopleNumber':10,
            'frequentTravelers':5,
            'fullLevel':1,
            'location':{
              'lat':22.323479,
              'lng':114.258338
            },
            'waitingPassengersCount':[
              {

                'actualPeopleCount': 50,
                'predictPeopleCount': 40
              },
              {

                'actualPeopleCount': 30,
                'predictPeopleCount': 30
              },
              {

                'actualPeopleCount': 20,
                'predictPeopleCount': 20
              },
              {

                'actualPeopleCount': 20,
                'predictPeopleCount': 30
              },
            ],
            'waitingTime':[
              {
                'predictTime':120,
                'actucalTime':90
              },
              {
                'predictTime':80,
                'actucalTime':70
              },
              {
                'predictTime':70,
                'actucalTime':70
              },
              {
                'predictTime':80,
                'actucalTime':60
              }
            ]
          }
        ]
    this.setState({busStops:busStopRecords})
  }

  renderBus = () => {
    const { buses } = this.state
    return buses.map(bus => {
      return (
        <MarkerWithLabel
          position={bus.location}
          animation={2}
          labelAnchor={new google.maps.Point(48, 56)}
          labelStyle={{ opacity: 1, background: 'white', padding: "8px" }}
          icon={{
                url: MinibusActive,
                anchor: new google.maps.Point(24, 24),
                scaledSize: new google.maps.Size(48, 48)
              }}
        >
        </MarkerWithLabel>
      )
    })
  }

  renderBusStops = (busStops) => {
    const selectedBusStop = this.state.selectedBusStop
    const buses = this.state.buses
    var list = []
    if(selectedBusStop){
      const { id, name, location, peopleNumber} = selectedBusStop
      list.push(
        <MarkerWithLabel
          position={location}
          animation={2}
          labelAnchor={new google.maps.Point(48, 56)}
          labelStyle={{ opacity: 1, background: 'white', padding: "8px" }}
          icon={{
                url: BusStopIcon,
                anchor: new google.maps.Point(24, 24),
                scaledSize: new google.maps.Size(48, 48)
              }}
        >
          <div>{name} {peopleNumber}</div>
        </MarkerWithLabel>
      )
    }
    else
    {
      busStops.map(busStop => {
        const { id, name, location, peopleNumber} = busStop
        list.push(
          <MarkerWithLabel
            position={location}
            animation={2}
            labelAnchor={new google.maps.Point(48, 56)}
            labelStyle={{ opacity: 1, background: 'white', padding: "8px" }}
            icon={{
                  url: BusStopIcon,
                  anchor: new google.maps.Point(24, 24),
                  scaledSize: new google.maps.Size(48, 48)
                }}
          >
            <div>{name} - {peopleNumber}</div>
          </MarkerWithLabel>
        )
      })

      buses.map(bus => {
        list.push(
          <MarkerWithLabel
            position={bus.location}
            animation={2}
            labelAnchor={new google.maps.Point(48, 56)}
            labelStyle={{ opacity: 0, background: 'white', padding: "8px" }}
            icon={{
                  url: BusActive,
                  anchor: new google.maps.Point(24, 24),
                  scaledSize: new google.maps.Size(48, 48)
                }}
          >
            <div> {} </div>
          </MarkerWithLabel>
        )
      })


      console.log(list)
    }

    return list
  }

  renderBusStopsCard = (busStops) => {
    return busStops.map(busStop => {
      return (
        <div onClick={() => this.selectBusStop(busStop)}>
          <BusStopCard
            busStop={busStop}
          />
        </div>
      )
    })
  }

  selectBusStop = (busStop) => {
    this.setState({ selectedBusStop: busStop})
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  clearSelectedBusStop = () => {
    this.setState({ selectedBusStop: null});
  }

  handleChange = name => event => {
    // console.log(name, event.target.value);
    this.setState({ [name]: event.target.value });
  };

  handleCheck = name => event => {
    // console.log(`${name} ${event.target.checked}`);
    this.setState({ [name]: event.target.checked });
  };

  render() {
    const { busStops, activeMarker, selectedMinibusLicense, status, showLicense, route, seq, keyword, filterOutRoute, filterIsIdle, gpsMode, filterLowBattery, selectedBusStop } = this.state;
    const user = this.props.user
    return (
      <div>
        <Row className='dashboard'>
          <Col md={8}>
            <ChenMap
              containerElement={<div style={{ height: `100vh`, width: '100%' }} />}
              mapElement={<div style={{ height: `100%`, width: '100%' }} />}
            >
              {this.renderBusStops(busStops)}
            </ChenMap>
          </Col>
          <Col md={4} style={{ height: '90%' }}>

            { (selectedBusStop) ?
              <div>
                <Button variant="contained" onClick={this.clearSelectedBusStop}>
                  Back
                </Button>
                <BusStopDetail
                  defaultBusStop={busStops[0]}
                  selectedBusStop={selectedBusStop}
                />
              </div>
            :
              <div className='info-container'>
                <div className='minibus-cards-container'>
                  <Typography color="textSecondary">
                    {`Bus Stop Number：${busStops.length}`}
                  </Typography>

                  {this.renderBusStopsCard(busStops)}
                </div>
              </div>
            }
          </Col>
        </Row>
      </div>
    )
  }
}

export default Dashboard;
