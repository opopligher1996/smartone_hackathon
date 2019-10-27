import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { GoogleMap, Marker, withGoogleMap, OverlayView, Polyline } from "react-google-maps";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TableList from '../../../components/TableList';
import { TableRow, TableCell } from '@material-ui/core';
import { Bar } from 'react-chartjs-2';
import { findIndex, forEach } from 'lodash';
import moment from 'moment';

class MinibusDetail extends Component {

  state = {
    journeySet: []
  }

  componentDidMount() {
    const { license, hardwareId } = this.props.info;
    this.getJourneySet(hardwareId);
  }

  getJourneySet = async (license) => {
    let url = `http://training.socif.co:3002/api/v2/minibus/getJourney?journeySet=true&license=${license}`;
    const results = await fetch(url).then(res => res.json());
    const journeySet = results.response;
    this.setState({ journeySet });
  }

  getFreqChartData = () => {
    const { journeySet } = this.state;
    let byWeekday = [0, 0, 0, 0, 0, 0, 0];
    forEach(journeySet, set => {
      const { startTime } = set;
      const weekday = moment(startTime).day();
      byWeekday[weekday]++;
    })
    const freqChartData = {
      labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      datasets: [{
        label: "本週出勤次數",
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: byWeekday
      }]
    }
    return freqChartData;
  }

  renderJourneySet = (journeySet, index) => {
    const { _id: journeySetId, license, route, seq, startTime } = journeySet;
    const { selectedjourneySetId } = this.state;

    return (
      <TableRow hover key={journeySetId} selected={journeySetId === selectedjourneySetId} onClick={() => {
        const win = window.open(`/#/rv/http%3A%2F%2Ftraining.socif.co%3A3002%2Fapi%2Fv2%2Frecord%2FgetRecord%3FjourneyId%3D${journeySetId}%26journeySet%3Dtrue%26skipLongTrace%3Dtrue`, '_blank');
        win.focus();
      }}>
        <TableCell component="th" scope="row">
          <img src={`https://minibusdashboard.blob.core.windows.net/dashboard/${journeySetId}.jpg`}
            style={{ width: 80 }}
          />
        </TableCell>
        <TableCell align="right">{route}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{`${new Date(startTime).toLocaleDateString()} ${new Date(startTime).toLocaleTimeString()}`}</TableCell>
        <TableCell align="right">{startTime}</TableCell>
      </TableRow>
    )
  }

  render() {
    const { journeySet } = this.state;
    const { info } = this.props;
    const { currentState, license, lastUpdate, route, batteryLeft } = info;
    const { journeyId, interval, passedStation, seq, trigger, isIdle = {}, gpsMode, temperature } = currentState;
    const { outRoute } = trigger;
    const rows = [
      { id: 'thumbnail', numeric: false, disablePadding: true, label: 'Thumbnail' },
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: true, disablePadding: false, label: 'Sequence' },
      { id: 'date', numeric: true, disablePadding: false, label: 'Date' },
      { id: 'startTime', numeric: true, disablePadding: false, label: 'startTime' },
    ];
    const freqChartData = this.getFreqChartData();
    // const timeChartData = this.getTimeChartData();

    return (
      <div>
        <Typography variant="h5" component="h2">
          {license}
        </Typography>
        <Typography color="textSecondary">
          {`路線: ${route} seq: ${seq} outRoute: ${outRoute} 最後更新: ${`${new Date(lastUpdate).toLocaleDateString()} ${new Date(lastUpdate).toLocaleTimeString()}`} interval: ${interval} isIdle: ${isIdle.status} isGPSStuck: ${isIdle.isGPSStuck} batteryLeft: ${batteryLeft}`}
        </Typography>
        {/* <Typography color="textSecondary">
          {`gpsMode: ${gpsMode}`}
        </Typography>
        <Typography color="textSecondary">
          {`temperature: ${temperature}`}
        </Typography> */}
        {/*


        <Typography color="textSecondary">
          {`journeyId: ${journeyId}`}
        </Typography>

        <Typography variant="body2" component="p">
          已過車站
          <br />
          {passedStation}
        </Typography> */}
        {/* <Bar
          data={freqChartData}
          width={300}
          height={100}
          options={{
            maintainAspectRatio: true,
            scales: {
                yAxes: [{
                    display: true,
                }]
            }
          }}
        /> */}
        <div className='journeySet-table-container'>
          <TableList
            rows={rows}
            data={journeySet}
            title={`過去軌跡`}
            renderCustomRow={this.renderJourneySet}
          />
        </div>
      </div>
    )
  }
}

export default withRouter(MinibusDetail);
