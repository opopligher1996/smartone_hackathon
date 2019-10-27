import React, { Component } from 'react';
import { orderBy as orderByFunc, filter } from 'lodash';
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


class SelectSample extends Component {

  state = {
    journeys: [],
    page: 0,
    rowsPerPage: 5,
    order: 'asc',
    orderBy: 'date',
    weekday: '',
    from: '',
    to: '',
    route: '',
    seq: 0
  }

  componentDidMount() {
    this.getJourneyList();
  }

  componentDidUpdate(prevProps, prevState) {
    const { weekday, from, to, route, seq } = this.state;
    if(prevState.weekday !== weekday ||
      prevState.from !== from ||
      prevState.to !== to ||
      prevState.route !== route ||
      prevState.seq !== seq)
      this.getJourneyList();
  }

  getJourneyList = async () => {
    const { weekday, from, to, route, seq } = this.state;
    let url = 'http://training.socif.co:3002/api/v2/minibus/getJourney?journeySet=true&limit=1000';
    if(weekday)
      url += `&weekday=${weekday}`;
    if(from)
      url += `&from=${from}`;
    if(to)
      url += `&to=${to}`;
    if(route)
      url += `&route=${route}`;
    if(seq)
      url += `&seq=${seq}`;
    const response = await fetch(url)
    .then(response => response.json());
    this.setState({ 
      journeys: response.response,
    });
  }

  filterJourney = () => {
  }

  renderJourney = () => {
    const { setJourneyFunc, selectedJourneyId } = this.props;
    const { journeys, page, rowsPerPage, order, orderBy } = this.state;
    return orderByFunc(journeys, [orderBy], [order]).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ _id: journeyId, route, seq, license, startTime }) => {
      return (
        <TableRow hover key={journeyId} selected={journeyId === selectedJourneyId} onClick={() => setJourneyFunc(journeyId)}>     
          <TableCell component="th" scope="row">
            <img src={`https://minibusdashboard.blob.core.windows.net/dashboard/${journeyId}.jpg`}
              style={{ width: 80 }}
            />
          </TableCell>
          <TableCell align="right">{journeyId}</TableCell>
          <TableCell align="right">{license}</TableCell>
          <TableCell align="right">{route}</TableCell>
          <TableCell align="right">{seq}</TableCell>
          <TableCell align="right">{`${new Date(startTime).toLocaleDateString()} ${new Date(startTime).toLocaleTimeString()}`}</TableCell>
          <TableCell align="right">{startTime}</TableCell>
        </TableRow>
      )
    })
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

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const { page, rowsPerPage, journeys, order, orderBy, weekday, from, to, route, seq } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, journeys.length - page * rowsPerPage);
    const rows = [
      { id: 'thumbnail', numeric: false, disablePadding: true, label: 'Thumbnail' },
      { id: '_id', numeric: false, disablePadding: false, label: 'Journey ID' },
      { id: 'license', numeric: true, disablePadding: false, label: 'License' },
      { id: 'route', numeric: false, disablePadding: false, label: 'Route' },
      { id: 'seq', numeric: true, disablePadding: false, label: 'Sequence' },
      { id: 'date', numeric: true, disablePadding: false, label: 'Date' },
      { id: 'startTime', numeric: true, disablePadding: false, label: 'Timestamp' },
    ];
    console.log(`order: ${order}, orderBy: ${orderBy}`);

    return (
      <div className='tester'>
        <Row>
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
                  { val: 1, display: '1' },
                  { val: 2, display: '2' },
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
                  { val: 1, display: 'Monday' },
                  { val: 2, display: 'Tuesday' },
                  { val: 3, display: 'Wednesday' },
                  { val: 4, display: 'Thursday' },
                  { val: 5, display: 'Friday' },
                  { val: 6, display: 'Saturday' },
                  { val: 7, display: 'Sunday' },
                ]}
              />
            </Col>
            <Col>
              <NativeListMenu 
                name={'From'}
                field={'from'}
                val={from}
                handleChange={this.handleChange}
                options={Array.from(Array(24).keys()).map(val => ({ val, display: val }))}
              />
            </Col>
            <Col>
              <NativeListMenu 
                name={'To'}
                field={'to'}
                val={to}
                handleChange={this.handleChange}
                options={Array.from(Array(24).keys()).map(val => ({ val, display: val }))}
              />
            </Col>
          </Row>
          <Paper>
            <TableToolbar title={'Journeys'} />
          <div>
            <Table>
              <TableFilter 
                // numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                // onSelectAllClick={this.handleSelectAllClick}
                onRequestSort={this.handleRequestSort}
                rowCount={journeys.length}
                rows={rows}
              />
              <TableBody>
                {this.renderJourney()}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 80 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={3}
                    count={journeys.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      native: true,
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    // ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </Paper>
        </Row>
      </div>
    )
  }
}

export default SelectSample;