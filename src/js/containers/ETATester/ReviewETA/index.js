import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { Bar, Scatter } from "react-chartjs-2";
import './styles.scss';

import ETACard from '../../../components/ETACard';

class ReviewETA extends Component {

  storeETA = async (method) => {
    const { route, seq, } = this.props;
    const url = `http://localhost:3004/api/v2/training/storeETA`;
    const response = await fetch(url, {
      body: JSON.stringify({
        route,
        seq,
        method,
      }), // must match 'Content-Type' header
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
    }).then(res => res.json());
    console.log('stored', response);
  }

  renderETACard = () => {
    const { etas } = this.props;
    return etas.map(eta => {
      return (
        <Col>
          <ETACard 
            eta={eta}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              this.storeETA(eta.method);
              // this.computeETAByML();
            }}
          >
            Store ETA
          </Button>
        </Col>
      )
    })
  }

  getETABarData = () => {
    const { etas } = this.props;
    return etas.map(({ method, etaIntervalSet }) => {
      const data = etaIntervalSet.map(({ time }) => time);
      return {
        label: method,
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data
      }
    })
  }

  getDistanceToTimeScatterData = () => {
    const { distanceToTime } = this.props;
    if(!distanceToTime.x || !distanceToTime.y)
      return { data: [] };
    const { x, y } = distanceToTime;
    const data = x.map((val, index) => {
      return { x: val, y: y[index] }
    });
    return {
      label: "Polynomial Regression",
      fillColor: "rgba(220,220,220,0.5)",
      strokeColor: "rgba(220,220,220,0.8)",
      highlightFill: "rgba(220,220,220,0.75)",
      highlightStroke: "rgba(220,220,220,1)",
      data
    };
  }

  render() {
    const { distanceToTime } = this.props;
    const datasets = this.getETABarData();
    const scatterDataset = this.getDistanceToTimeScatterData();
    console.log('scatterDataset', scatterDataset);
    const labels = datasets[0] ? [...Array(datasets[0].data.length).keys()] : [];
    console.log('datasets', datasets);
    return (
      <Row>
        {this.renderETACard()}
        <Bar data={ {
          labels,
          datasets
        }} options={{
          scales: {
            // yAxes: [{
            //   ticks: {
            //       min: 0, // minimum value
            //       max: 200 // maximum value
            //   }
            // }]
         },
          //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
          scaleBeginAtZero : true,
        
          //Boolean - Whether grid lines are shown across the chart
          scaleShowGridLines : true,
        
          //String - Colour of the grid lines
          scaleGridLineColor : "rgba(0,0,0,.05)",
        
          //Number - Width of the grid lines
          scaleGridLineWidth : 1,
        
          //Boolean - Whether to show horizontal lines (except X axis)
          scaleShowHorizontalLines: true,
        
          //Boolean - Whether to show vertical lines (except Y axis)
          scaleShowVerticalLines: true,
        
          //Boolean - If there is a stroke on each bar
          barShowStroke : true,
        
          //Number - Pixel width of the bar stroke
          barStrokeWidth : 2,
        
          //Number - Spacing between each of the X value sets
          barValueSpacing : 5,
        
          //Number - Spacing between data sets within X values
          barDatasetSpacing : 1,
        }}/>
        <div>
          {JSON.stringify(distanceToTime.score)}
        </div>
        <Scatter data={{
          datasets: [scatterDataset]
        }} options={{}} />
      </Row>
    )
  }
}

export default ReviewETA;