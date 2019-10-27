import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col, Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { forEach } from 'lodash';
import { filter } from 'lodash';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

class CustomerReport extends Component {

  state = {
    passenger1Mac:"A0:32:99:94:2B:C3",
    passenger2Mac:"2D-62-9E-7C-02-97",
    passenger1Rssi: null,
    passenger2Rssi: null,
    isPassenger1Start:false,
    isPassenger2Start:false,
    passenger1Time:0,
    passenger2Time:0,
    passenger1StartTime:null,
    passenger2StartTime:null,
    passenger1EndTime:'Waiting',
    passenger2EndTime:'Waiting'
  }

  componentDidMount() {
    const customerInfo = [
      {
        'id':1,
        'macAddress':"BF-43-0E-78-96-71",
        'startTime':1572044400,
        'endTime':1572044700,
        'selectedBus':'91M',
      },
      {
        'id':2,
        'macAddress':"F0-93-5D-F0-9E-90",
        'startTime':1572044520,
        'endTime':1572044700,
        'selectedBus':'91M'
      },
      {
        'id':3,
        'macAddress':"96-43-6D-32-D5-68",
        'startTime':1572046200,
        'endTime':1572046800,
        'selectedBus':'11'
      },
      {
        'id':4,
        'macAddress':"A3-C6-2C-2A-5A-40",
        'startTime':1572047700,
        'endTime':1572047760,
        'selectedBus':'96R'
      },
      {
        'id':5,
        'macAddress':"BF-43-0E-78-96-71",
        'startTime':1572084000,
        'endTime':1572084300,
        'selectedBus':'91M'
      },
      {
        'id':6,
        'macAddress':"78-25-E0-9D-78-ED",
        'startTime':1572081300,
        'endTime':1572081480,
        'selectedBus':'91M'
      }
    ]
    this.interval = setInterval(() => {
      this.getAllCustomerData()
    }, 2000);
  }

  getAllCustomerData = async () => {
    let url = 'https://smartone-h.azurewebsites.net/api/Station'
    const results = await fetch(url).then(res => res.json());
    const {passenger1Rssi, passenger2Rssi} = results
    const {passenger1Time, passenger2Time, isPassenger1Start, isPassenger2Start} = this.state

    //continue counting
    var tmp1Time = passenger1Time
    if(passenger1Rssi == 0 && isPassenger1Start)
    {
      tmp1Time = tmp1Time + 2
      this.setState({
        passenger1Time:tmp1Time,
      })
    }

    var tmp2Time = passenger2Time
    if(passenger2Rssi == 0 && isPassenger2Start)
    {
      tmp2Time = tmp2Time + 2
      this.setState({
        passenger2Time:tmp2Time,
      })
    }

    //start network
    var tmp1 = false
    if(passenger1Rssi == 0 && !isPassenger1Start)
    {
      tmp1 = true
      var tmp1StartTime = new Date().toLocaleString()
      this.setState({
        isPassenger1Start:tmp1,
        passenger1StartTime:tmp1StartTime
      })
    }

    var tmp2 = false
    if(passenger2Rssi == 0 && !isPassenger2Start)
    {
      tmp2 = true
      var tmp2StartTime = new Date().toLocaleString()
      this.setState({
        isPassenger2Start:tmp2,
        passenger2StartTime:tmp2StartTime
      })
    }


    //end data
    if(passenger1Rssi == 100 && isPassenger1Start)
    {
      var tmp1EndTime = new Date().toLocaleString()
      this.setState({
        isPassenger1Start:false,
        passenger1EndTime:tmp1EndTime
      })
    }


    if(passenger2Rssi == 100 && isPassenger2Start)
    {
      var tmp2EndTime = new Date().toLocaleString()
      this.setState({
        isPassenger2Start:false,
        passenger2EndTime:tmp2EndTime
      })
    }

  }

  renderCustomer1Data = () => {
    const { passenger1Mac,passenger1Rssi,isPassenger1Start,passenger1Time,passenger1StartTime,passenger1EndTime} = this.state
    var updatePassenger1Time = passenger1Time
    if(isPassenger1Start || passenger1Time>0)
    {
      return (
        <tr>
          <td>{passenger1Mac}</td>
          <td>{passenger1StartTime}</td>
          <td>{passenger1EndTime}</td>
          <td>{passenger1Time}</td>
        </tr>
      )
    }
  }

  renderCustomer2Data = () => {
    const { passenger2Mac,passenger2Rssi,isPassenger2Start,passenger2Time,passenger2StartTime,passenger2EndTime} = this.state
    var updatePassenger2Time = passenger2Time
    if(isPassenger2Start || passenger2Time>0)
    {
      return (
        <tr>
          <td>{passenger2Mac}</td>
          <td>{passenger2StartTime}</td>
          <td>{passenger2EndTime}</td>
          <td>{passenger2Time}</td>
        </tr>
      )
    }
  }

  render() {
    return (
      <div>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            Select Bus Stop
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item>002(清水灣龍窩村)</Dropdown.Item>
            <Dropdown.Item>003(白石窩)</Dropdown.Item>
            <Dropdown.Item>004(香港科技大學(南))</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <div>
          Bus Stop ID: 001 (鑽石山地鐵站)
        </div>
        <div>
          Buses:
          <Button style={{ right: 20}} variant="danger">11</Button>
          <Button style={{ right: 20}} variant="danger">82P</Button>
          <Button style={{ right: 20}} variant="danger">91</Button>
          <Button style={{ right: 20}} variant="danger">91M</Button>
          <Button style={{ right: 20}} variant="danger">91P</Button>
          <Button style={{ right: 20}} variant="danger">92</Button>
          <Button style={{ right: 20}} variant="danger">96R</Button>
          <Button style={{ right: 20}} variant="danger">272S</Button>
          <Button style={{ right: 20}} variant="danger">286M</Button>
          <Button style={{ right: 20}} variant="danger">671</Button>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Mac Address</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Waiting Time(s)</th>
            </tr>
          </thead>
          <tbody>
            {this.renderCustomer1Data()}
            {this.renderCustomer2Data()}
          </tbody>
        </Table>
      </div>
    )
  }
}

export default CustomerReport;
