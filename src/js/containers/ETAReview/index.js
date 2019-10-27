import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy, meanBy, maxBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
// import './styles.scss';
import ETASelector from '../../components/ETASelector';
import TableList from '../../components/TableList';

class ETAReview extends Component {

  state = {
    eta: null,
    perfs: []
  }
  
  getEtaPerformance = async () => {
    const { eta } = this.state;
    if(!eta)
      return;
    const result = await fetch(`http://localhost:3004/api/v2/training/getEtaPerformance?etaId=${eta._id}`).then(res => res.json());
    const perfs = result.response;
    const updatedPerfs = perfs.map(perf => {
      const { route, seq, weekday, hour, timestamp, stationPerformance } = perf;
      return {
        route, 
        seq, 
        weekday, 
        hour,
        timestamp,
        meanError: meanBy(stationPerformance, 'timeDiff') || -1,
        meanErrorNoFirst: meanBy(stationPerformance.slice(1), 'timeDiff') || -1,
        maxError: (maxBy(stationPerformance, 'timeDiff') || {}).timeDiff || -1,
        maxErrorNoFirst: (maxBy(stationPerformance.slice(1), 'timeDiff') || {}).timeDiff || -1,
      }
    });
    console.log('updatedPerfs', updatedPerfs);
    this.setState({ perfs: updatedPerfs });
  }

  renderPerf = (perf, index) => {
    // const { selectedEtaId } = this.state;
    // const { _id: etaId, route, seq, hour, weekday, generationDate, method, isBase, remark } = eta;
    const { route, seq, weekday, hour, timestamp, meanError, meanErrorNoFirst, maxError, maxErrorNoFirst } = perf;

    return (
      <TableRow hover key={`perf-${index}`}>     
        <TableCell align="left">{route}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{weekday}</TableCell>
        <TableCell align="right">{hour}</TableCell>
        <TableCell align="right">{timestamp}</TableCell>
        <TableCell align="right">{meanError}</TableCell>
        <TableCell align="right">{meanErrorNoFirst}</TableCell>
        <TableCell align="right">{maxError}</TableCell>
        <TableCell align="right">{maxErrorNoFirst}</TableCell>
      </TableRow>
    )
  }

  onSelectETA = (eta) => {
    this.setState({ eta }, ()=> { this.getEtaPerformance() })
  }

  render() {
    const { perfs } = this.state;
    const perfRows = [
      { id: 'route', numeric: false, disablePadding: false, label: 'Selected' },
      { id: 'seq', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'weekday', numeric: false, disablePadding: false, label: 'Weekday' },
      { id: 'hour', numeric: false, disablePadding: false, label: 'Hour' },
      { id: 'timestamp', numeric: false, disablePadding: false, label: 'Journey Time' },
      { id: 'meanError', numeric: false, disablePadding: false, label: 'Mean Error' },
      { id: 'meanErrorNoFirst', numeric: false, disablePadding: false, label: 'Mean Error (No first station)' },
      { id: 'maxError', numeric: false, disablePadding: false, label: 'Max Error' },
      { id: 'maxErrorNoFirst', numeric: false, disablePadding: false, label: 'Max Error (No first station)' },
    ];

    return (
      <div className='tester'>
        <ETASelector 
          onSelectETA={this.onSelectETA}
        />
        <TableList 
          rows={perfRows}
          data={perfs}
          title={`Eta Performace`}
          renderCustomRow={this.renderPerf}
        />
      </div>
    )
  }
}

export default ETAReview;