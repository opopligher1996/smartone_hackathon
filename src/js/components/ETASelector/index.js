import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Link } from 'react-router-dom'
import Button from '@material-ui/core/Button';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
// import './styles.scss';
import TableList from '../TableList';
import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import NativeListMenu from '../NativeListMenu';

class ETASelector extends Component {

  state = {
    route: '11', 
    seq: 1, 
    weekday: null,
    weekdayAsFilter: false,
    etas: [],
    eta: null,
    selectedEtaId: null
  }

  componentDidMount() {
    this.getETAs();
  }

  componentDidUpdate(prevProps, prevState) {
    if(
        prevState.route !== this.state.route || 
        prevState.seq !== this.state.seq || 
        prevState.weekday !== this.state.weekday || 
        prevState.weekdayAsFilter !== this.state.weekdayAsFilter
      ) {
        this.getETAs();
      }
  }

  getETAs = async () => {
    const { route, seq, weekday, weekdayAsFilter } = this.state;
    let url = `http://localhost:3004/api/v2/training/getETAData?ignoreIsBase=true`;
    if(route)
      url += `&route=${route}`;
    if(seq)
      url += `&seq=${seq}`;
    if(weekdayAsFilter && weekday)
      url += `&weekday=${weekday}`;
    const response = await fetch(url).then(res => res.json());
    const etas = response.response;
    this.setState({ etas });
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
    if(this.props.handleChange)
      this.props.handleChange(name, event.target.value);
  };

  handleFilterCheck = name => event => {
    this.setState({ [name]: event.target.checked });
  };

  onSelectETA = (eta) => {
    this.setState({ eta, selectedEtaId: eta._id });
    if(this.props.onSelectETA)
      this.props.onSelectETA(eta);
  }

  renderETA = (eta, index) => {
    const { selectedEtaId } = this.state;
    const { _id: etaId, route, seq, hour, weekday, generationDate, method, isBase, remark } = eta;
    
    return (
      <TableRow hover key={`eta-${index}`} selected={etaId === selectedEtaId} onClick={() => this.onSelectETA(eta)}>     
        <TableCell align="left">{route}</TableCell>
        <TableCell align="right">{seq}</TableCell>
        <TableCell align="right">{weekday}</TableCell>
        <TableCell align="right">{hour}</TableCell>
        <TableCell align="right">{generationDate}</TableCell>
        <TableCell align="right">{`${new Date(generationDate).toLocaleDateString()} ${new Date(generationDate).toLocaleTimeString()}`}</TableCell>
        <TableCell align="right">{method}</TableCell>
        <TableCell align="right">{isBase ? 'true' : 'false'}</TableCell>
        <TableCell align="right">{remark}</TableCell>
      </TableRow>
    )
  }

  render() {
    const { route, seq, weekday, weekdayAsFilter, etas } = this.state; 
    const rows = [
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: false, disablePadding: false, label: 'Sequence' },
      { id: 'weekday', numeric: false, disablePadding: false, label: 'Weekday' },
      { id: 'hour', numeric: false, disablePadding: false, label: 'Hour' },
      { id: 'generationDate', numeric: true, disablePadding: false, label: 'Timestamp' },
      { id: 'date', numeric: true, disablePadding: false, label: 'Generated at' },
      { id: 'method', numeric: true, disablePadding: false, label: 'Method' },
      { id: 'isBase', numeric: false, disablePadding: false, label: 'Is Base?' },
      { id: 'remark', numeric: false, disablePadding: false, label: 'Remark' },
    ];

    return (
      <div>
        <Row>
            <Col>
              <NativeListMenu 
                name={'Route'}
                field={'route'}
                val={route}
                handleChange={this.handleChange}
                options={[
                  { val: '11', display: '11' },
                  { val: '11A', display: '11A' },
                  { val: '11B', display: '11B' },
                  { val: '11M', display: '11M' },
                  { val: '11S', display: '11S' },
                  { val: '12', display: '12' },
                  { val: '12A', display: '12A' },
                ]}
              />
            </Col>
            <Col>
              <NativeListMenu 
                name={'Seq'}
                field={'seq'}
                val={seq}
                handleChange={this.handleChange}
                options={[
                  { val: '1', display: '1' },
                  { val: '2', display: '2' },
                ]}
              />
            </Col>
            <Col>
              <NativeListMenu 
                name={'Weekday'}
                field={'weekday'}
                val={weekday}
                handleChange={this.handleChange}
                options={[
                  { val: '1', display: 'Monday' },
                  { val: '2', display: 'Tuesday' },
                  { val: '3', display: 'Wednesday' },
                  { val: '4', display: 'Thursday' },
                  { val: '5', display: 'Friday' },
                  { val: '6', display: 'Saturday' },
                  { val: '7', display: 'Sunday' },
                ]}
              />
            </Col>
          <Col>
            <FormControlLabel
              control={
                <Checkbox
                  checked={weekdayAsFilter}
                  onChange={this.handleFilterCheck('weekdayAsFilter')}
                  // value={`checked-${fsId}`}
                />
              }
              label="Weekday as Filter"
            />
          </Col>
        </Row>
        <TableList 
          rows={rows}
          data={etas}
          title={`ETA`}
          renderCustomRow={this.renderETA}
        />
      </div>
    )
  }
}

export default ETASelector;