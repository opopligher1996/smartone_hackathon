import React, { Component } from 'react';
import { orderBy as orderByFunc } from 'lodash';
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
import './styles.scss';
import TablePaginationActions from '../TablePaginationActions';
import TableFilter from '../TableFilter';
import TableToolbar from '../TableToolbar';

class TableList extends Component {

  state = {
    page: 0,
    rowsPerPage: 5,
    order: 'asc',
    orderBy: 'date',
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

  renderRows = () => {
    const { setJourneyFunc, selectedJourneyId, data, renderCustomRow } = this.props;
    const { page, rowsPerPage, order, orderBy } = this.state;
    // console.log('data', data);
    // console.log('orderByFunc(data, [orderBy], [order])', orderByFunc(data, [orderBy], [order]));
    return orderByFunc(data, [orderBy], [order]).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item, index) => {
      return renderCustomRow(item, index)
    })
  }

  render() {
    const { rows, data, title } = this.props;
    const { page, rowsPerPage, order, orderBy, } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);

    return (
      <Row>
        <Paper style={{ flex: 1 }}>
          <TableToolbar title={title} />
        <div>
          <Table>
            <TableFilter 
              // numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              // onSelectAllClick={this.handleSelectAllClick}
              onRequestSort={this.handleRequestSort}
              rowCount={data.length}
              rows={rows}
            />
            <TableBody>
              {this.renderRows()}
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
                  count={data.length}
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
    )
  }
}

export default TableList;