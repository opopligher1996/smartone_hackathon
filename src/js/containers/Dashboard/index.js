import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import React, { Component } from 'react';
import { GoogleMap, Marker, withGoogleMap, OverlayView, Polyline } from "react-google-maps";
import { find, orderBy, filter } from "lodash";
const { MarkerWithLabel } = require("react-google-maps/lib/components/addons/MarkerWithLabel");
import './styles.scss';
import MinibusActive from '../../../../assets/img/minibus_icon.png';
import MinibusInActive from '../../../../assets/img/minibus_icon_inactive.png';
import BusStopIcon from '../../../../assets/img/bus-stop.svg'
import OpTopBar from '../../components/OpTopBar';
import ChenMap from '../../components/ChenMap';
import { TableRow, TableCell, FormControl, InputLabel, Select, MenuItem, Typography, TextField, InputAdornment } from '@material-ui/core';
import MinibusDetail from './MinibusDetail';
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
    busStops: [],
    minibuses: [],
    licenseIDPair: [],
    selectedMinibusRecords: [],
    selectedMinibusLicense: null,
    activeMarker: null,
    status: 0,
    showLicense: false,
    filterOutRoute: false,
    filterIsIdle: false,
    route: null,
    gpsMode: null,
    filterLowBattery: false,
    seq: 0,
    keyword: ''
  }

  componentDidMount() {
    this.checkRole()
    this.getBusStop()
  }

  checkRole = () => {
    console.log('checkRole')
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
            'fullLevel':2,
            'location':{
              'lat':22.340175,
              'lng':114.200950
            }
          },
          {
            'id':1,
            'name':'彩虹錦雲樓',
            'temperature':35,
            'peopleNumber':5,
            'fullLevel':1,
            'location':{
              'lat':22.337185,
              'lng':114.204537
            }
          },
          {
            'id':2,
            'name':'清水灣龍窩村',
            'temperature':29,
            'peopleNumber':10,
            'fullLevel':1,
            'location':{
              'lat':22.333301,
              'lng':114.234829
            }
          },
          {
            'id':3,
            'name':'白石窩',
            'temperature':32,
            'peopleNumber':5,
            'fullLevel':1,
            'location':{
              'lat':22.335955,
              'lng':114.241677
            }
          },
          {
            'id':4,
            'name':'香港科技大學(南)',
            'temperature':30,
            'peopleNumber':40,
            'fullLevel':3,
            'location':{
              'lat':22.333376,
              'lng':114.262680
            }
          },
          {
            'id':5,
            'name':'坑口(北)巴士總站',
            'temperature':40,
            'peopleNumber':20,
            'fullLevel':2,
            'location':{
              'lat':22.317761,
              'lng':114.268676
            }
          },
          {
            'id':6,
            'name':'寶林公共運輸交匯處',
            'temperature':36,
            'peopleNumber':10,
            'fullLevel':1,
            'location':{
              'lat':22.323479,
              'lng':114.258338
            }
          }
        ]
    this.setState({busStops:busStopRecords})
  }

  renderBusStops = (busStops) => {
    console.log('busStops')
    console.log(busStops)
    return busStops.map(busStop => {
      const { id, name, location} = busStop
      return (
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
          <div>{name}</div>
        </MarkerWithLabel>
      )
    })
  }


  filteredMinibuses = () => {
    const { minibuses, status, selectedMinibusLicense, route, seq, keyword, gpsMode, filterOutRoute, filterIsIdle, filterLowBattery } = this.state;
    //Regard as active if the minibus returns update in 5 min
    const currentTime = + new Date();
    let minibusesToShow = minibuses;
    minibusesToShow = minibusesToShow.map(minibus => {
      const { lastUpdate } = minibus;
      return {
        ...minibus,
        isOnline: (currentTime - lastUpdate) < 5*1000*60
      }
    })
    minibusesToShow = filter(minibusesToShow, {
      ...(status == 1 && { isOnline: true }),
      ...(status == 2 && { isOnline: false }),
      ...(selectedMinibusLicense && { license: selectedMinibusLicense }),
      ...(route && { route }),
    });
    minibusesToShow = filter(minibusesToShow, ({ license, route, currentState, batteryLeft }) => {
      // console.log(`minibusesToShow license: ${license} route: ${route}`);
      // console.log('currentState.isIdle', currentState.isIdle);
      // if(currentState.trigger && currentState.trigger.isIdle) {
      //   console.log('isIdle', currentState.trigger.isIdle.status);
      // }
      let filtered = true;
      if(seq && currentState.seq != seq)
        filtered = false;
      if(gpsMode && currentState.gpsMode != gpsMode)
        filtered = false;
      if(seq && currentState.seq != seq)
        filtered = false;
      if(filterOutRoute && (!currentState.trigger || currentState.trigger.outRoute === "undefined" || parseInt(currentState.trigger.outRoute) < 20))
        filtered = false;
      if(filterIsIdle && !currentState.isIdle.status)
        filtered = false;
      if(filterLowBattery && parseInt(batteryLeft) > 60)
        filtered = false;
      if(keyword !== "" && !license.includes(keyword) && (route && !route.includes(keyword)))
        filtered = false;
      return filtered;
    });
    minibusesToShow = orderBy(minibusesToShow, ['isOnline', 'license',], ['desc', 'asc']);
    return minibusesToShow;
  }

  renderMinibusCards = (minibuses) => {
    return minibuses.map(minibus => {
      return (
        <div onClick={() => this.selectMinibus(minibus)}>
          <MinibusCard
            minibus={minibus}
          />
        </div>
      )
    })
  }

  renderBusStopsCard = (busStops) => {
    return busStops.map(busStop => {
      return (
        <div>
          <BusStopCard
            busStop={busStop}
          />
        </div>
      )
    })
  }

  reverMinibusesSeq = (minibuses,selectedRoute) => {
    if(minibuses.length == 0)
      return null
    minibuses.forEach(({route, currentState}) => route == selectedRoute?currentState.seq = !(currentState.seq-1)+1:null)
    return minibuses
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onMinibusClick = (props, marker, e) => {
    this.setState({
      activeMarker: marker,
    });
  }

  clearSelectedMinibus = () => {
    this.setState({ selectedMinibusLicense: null, selectedMinibusRecords: [] });
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
    const { busStops, activeMarker, selectedMinibusRecords, selectedMinibusLicense, status, showLicense, route, seq, keyword, filterOutRoute, filterIsIdle, gpsMode, filterLowBattery } = this.state;
    const minibusRows = [
      { id: 'license', numeric: false, disablePadding: true, label: '車牌' },
      { id: 'route', numeric: false, disablePadding: false, label: '路線' },
      { id: 'lastUpdate', numeric: true, disablePadding: false, label: '最後更新時間' },
      { id: 'currentState.passedStation', numeric: false, disablePadding: false, label: '已過車站' },
    ];
    const minibuses = this.filteredMinibuses();
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

            { (selectedMinibusLicense && minibuses.length) ?
              <div className='detail-container'>
                <Button variant="contained" onClick={this.clearSelectedMinibus}>
                  返回
                </Button>
                <MinibusDetail
                  info={minibuses[0]}
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
