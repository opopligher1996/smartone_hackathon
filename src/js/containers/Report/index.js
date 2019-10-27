import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { forEach } from 'lodash';
import { filter } from 'lodash';
import { BarChart, Bar, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

class Report extends Component {


  renderServicePerformance = () => {
    const data = [
      {name: '8:00 - 9:00', percentage: 80},
      {name: '9:00 - 10:00', percentage: 70},
      {name: '10:00 - 11:00', percentage: 50},
      {name: '11:00 - 12:00', percentage: 56}
    ];
    return  (
      <BarChart width={1500} height={200} data={data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
         <CartesianGrid strokeDasharray="3 3"/>
         <XAxis dataKey="name"/>
         <YAxis/>
         <Tooltip/>
         <Legend />
         <Bar dataKey="percentage" fill="#82ca9d" />
      </BarChart>
    );
  }

  renderPassengerNumber = () => {
    const data = [
      {name: '8:00 - 9:00', passengerNumber: 72},
      {name: '9:00 - 10:00', passengerNumber: 119},
      {name: '10:00 - 11:00', passengerNumber: 90},
      {name: '11:00 - 12:00', passengerNumber: 70}
    ];
    return  (
      <BarChart width={1500} height={200} data={data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
         <CartesianGrid strokeDasharray="3 3"/>
         <XAxis dataKey="name"/>
         <YAxis/>
         <Tooltip/>
         <Legend />
         <Bar dataKey="passengerNumber" fill="#8884d8" />
      </BarChart>
    );
  }

  renderFrequentTravelersNumber = () => {
    const data = [
      {name: '8:00 - 9:00', nonfrequentTravelers: 39, frequentTravelers: 33},
      {name: '9:00 - 10:00', nonfrequentTravelers: 95, frequentTravelers: 24},
      {name: '10:00 - 11:00', nonfrequentTravelers: 50, frequentTravelers: 40},
      {name: '11:00 - 12:00', nonfrequentTravelers: 40, frequentTravelers: 30}
    ];
    return  (
      <BarChart
        width={1500}
        height={200}
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="nonfrequentTravelers" stackId="a" fill="#FFBB28" />
        <Bar dataKey="frequentTravelers" stackId="a" fill="#FF8042" />
      </BarChart>
    );
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
        <div>
          Service Performance
          {this.renderServicePerformance()}
        </div>
        <div>
          Number of Passengers
          {this.renderPassengerNumber()}
        </div>
        <div>
          Number of Frequent Travelers
          {this.renderFrequentTravelersNumber()}
        </div>
      </div>
    )
  }
}

export default Report;
