import React, { Component } from 'react';
import { findIndex, meanBy, maxBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import './styles.scss';
import TablePaginationActions from '../../../../components/TablePaginationActions';
import TableFilter from '../../../../components/TableFilter';
import TableToolbar from '../../../../components/TableToolbar';
import NativeListMenu from '../../../../components/NativeListMenu';
import TableList from '../../../../components/TableList';
import PaperTile from '../../../../components/PaperTile';

class RecordEditor extends Component {

  state = {
    page: 0,
    rowsPerPage: 5,
    order: 'asc',
    orderBy: 'date',
    weekday: null,
    hour: null,
    etaSet: {},
    featureSet: {},
    etaIntervalSet: [],
    isFeatureSetExists: false,
    stationPerformance: [],
    intervalPerformance: []
  }

  componentDidMount() {
    this.getFeatureSet();
    this.getEtaPerformance();
  }

  componentDidUpdate(prevProps, prevState) {
    const { weekday, hour } = this.state;
    if(prevState.weekday !== weekday || prevState.hour !== hour || prevProps.records !== this.props.records) {
      this.updateETAComparison();
      this.getEtaPerformance();
    }
  }

  getEtaPerformance = async () => {
    const { records } = this.props;
    const { journeyId } = records[0].currentState;
    if(!records)
      return;
    const result = await fetch(`http://localhost:3004/api/v2/training/getEtaPerformance?journeyId=${journeyId}`).then(res => res.json());
    const perf = result.response[0];
    const { route, seq, weekday, hour, timestamp, stationPerformance, intervalPerformance } = perf;
    const stationPerformanceNoFirst = stationPerformance.concat().shift();
    const meanError = meanBy(stationPerformance, 'timeDiff') || -1;
    const meanErrorNoFirst = meanBy(stationPerformanceNoFirst, 'timeDiff') || -1;
    const maxError = (maxBy(stationPerformance, 'timeDiff') || {}).timeDiff || -1;
    const maxErrorNoFirst = (maxBy(stationPerformanceNoFirst, 'timeDiff') || {}).timeDiff || -1;
    this.setState({ stationPerformance, intervalPerformance, meanError, meanErrorNoFirst, maxError, maxErrorNoFirst });
  }

  updateETAComparison = async () => {
    await this.getETASet();
    this.computeETADeviation();
  }

  renderRecords = (record, index) => {
    const { setRecordFunc, selectedRecordId } = this.props;
    const { _id: recordId, lastUpdate, currentState } = record;
    const { interval, speed, accuracy, provider } = currentState;

    return (
      <TableRow hover key={recordId} selected={recordId === selectedRecordId} onClick={() => {
        console.log('record onclick', record);
        setRecordFunc(recordId)
      }}>     
        <TableCell align="right">{index}</TableCell>
        <TableCell align="right">{recordId}</TableCell>
        <TableCell align="right">{interval}</TableCell>
        <TableCell align="right">{speed}</TableCell>
        <TableCell align="right">{accuracy}</TableCell>
        <TableCell align="right">{provider}</TableCell>
        <TableCell align="right">{`${new Date(lastUpdate).toLocaleDateString()} ${new Date(lastUpdate).toLocaleTimeString()}`}</TableCell>
        <TableCell align="right">{lastUpdate}</TableCell>
      </TableRow>
    )
  }
  
  renderStationPerf = (station, index) => {
    const { passedStation, timeDiff } = station;

      return (
        <TableRow hover key={`passedStation-${passedStation}`}>     
          <TableCell align="right">{passedStation}</TableCell>
          <TableCell align="right">{timeDiff}</TableCell>
        </TableRow>
      )
  }

  renderIntervalPerf = (intervalRecord, index) => {
    const { interval, timeDiff } = intervalRecord;

      return (
        <TableRow hover key={`interval-${interval}`}>     
          <TableCell align="right">{interval}</TableCell>
          <TableCell align="right">{timeDiff}</TableCell>
        </TableRow>
      )
  }

  getETASet = async () => {
    const { records } = this.props;
    const { route, currentState } = records[0];
    const { seq } = currentState;
    const { weekday, hour } = this.state;
    let url = `http://localhost:3002/api/v2/eta/getFallbackETA?route=${route}&seq=${seq}`;
    if(weekday)
      url += `&weekday=${weekday}`;
    if(hour)
      url += `&hour=${hour}`;
    const response = await fetch(url).then(res => res.json());
    const etaSet = response.response;
    const { etaInfo } = etaSet;
    const { etaIntervalSet } = etaInfo;
    console.log('etaIntervalSet', etaIntervalSet);
    await this.setState({ etaIntervalSet });
  }

  getFeatureSet = async () => {
    const { records } = this.props;
    if(!records || !records.length)
      return;
    const { currentState } = records[0];
    const { journeyId } = currentState;
    const response = await fetch(`http://localhost:3004/api/v2/training/getJourneyFeatureSet?journeyId=${journeyId}`)
    .then(response => response.json());
    let featureSet = response.response;
    if(!featureSet) {
      await this.setState({ isFeatureSetExists: false });
      featureSet = await this.saveFeatureSetToDB(journeyId);
    }
    const { weekday, hour } = featureSet;
    this.setState({ featureSet, isFeatureSetExists: true, weekday, hour });
  }

  saveFeatureSetToDB = async (journeyId) => {

    return await fetch('http://localhost:3004/api/v2/training/storeJourneyFeatureSet', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        journeyId,
      })
    }).then(res => res.json());
  }

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: parseInt(event.target.value) });
  };

  handleRequestSort = (event, property) => {
    const orderBy = property;
    let order = 'desc';

    if (this.state.orderBy === property && this.state.order === 'desc') {
      order = 'asc';
    }

    this.setState({ order, orderBy });
  };

  render() {
    const { records } = this.props;
    const { page, rowsPerPage, order, orderBy, weekday, hour, featureSet, stationPerformance, intervalPerformance, meanError, meanErrorNoFirst, maxError, maxErrorNoFirst } = this.state;
    const { i2i } = featureSet;
    const rows = [
      { id: 'index', numeric: false, disablePadding: true, label: 'Index' },
      { id: '_id', numeric: false, disablePadding: false, label: 'Record ID' },
      { id: 'currentState.interval', numeric: true, disablePadding: false, label: 'Interval' },
      { id: 'currentState.speed', numeric: false, disablePadding: false, label: 'Speed' },
      { id: 'currentState.accuracy', numeric: true, disablePadding: false, label: 'Accuracy' },
      { id: 'currentState.provider', numeric: false, disablePadding: false, label: 'Provider' },
      { id: 'date', numeric: true, disablePadding: false, label: 'Date' },
      { id: 'lastUpdate', numeric: true, disablePadding: false, label: 'Timestamp' },
    ];
    const stationRows = [
      { id: 'passedStation', numeric: false, disablePadding: true, label: 'Station' },
      { id: 'timeDiff', numeric: false, disablePadding: false, label: 'Error' },
    ];
    const intervalRows = [
      { id: 'interval', numeric: false, disablePadding: true, label: 'Interval' },
      { id: 'timeDiff', numeric: false, disablePadding: false, label: 'timeDiff' },
    ];

    console.log(`order: ${order}, orderBy: ${orderBy}`);

    return (
      <div className='tester'>
        <TableList 
          rows={rows}
          data={records}
          title={`Records`}
          renderCustomRow={this.renderRecords}
        />
        <b>Mean Station Error:</b>{meanError}<br />
        <b>Mean Station Error without 1st Station:</b>{meanErrorNoFirst}<br />
        <b>Max Station Error:</b>{maxError}<br />
        <b>Max Station Error without 1st station:</b>{maxErrorNoFirst}<br />
        <TableList 
          rows={stationRows}
          data={stationPerformance}
          title={`Station Error`}
          renderCustomRow={this.renderStationPerf}
        />
        <TableList 
          rows={intervalRows}
          data={intervalPerformance}
          title={`Interval Error`}
          renderCustomRow={this.renderIntervalPerf}
        />
      </div>
    )
  }
}

export default RecordEditor;