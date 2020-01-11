import React, { Component, PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { GoogleMap, Marker, withGoogleMap, OverlayView, Polyline } from "react-google-maps";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TableList from '../../../components/TableList';
import ActiveShapePieChart from '../../../components/ActiveShapePieChart';
import BiaxialBarChart from '../../../components/BiaxialBarChart';
import BiaxialLineChart from '../../../components/BiaxialLineChart';
import { TableRow, TableCell } from '@material-ui/core';
import { findIndex, forEach } from 'lodash';
import moment from 'moment';
import { BarChart, Bar, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Sector } from 'recharts';

class BusStopDetail extends Component {

  state = {
    defaultBusStop: null,
    selectedBusStop: null
  }

  componentDidMount() {
    const selectedBusStop = this.props.selectedBusStop;
    this.setState({selectedBusStop: selectedBusStop})
  }


  render() {
    const { selectedBusStop } = this.state;
    var name, temperature, peopleNumber, fullLevel, location, frequentTravelers = null
    if(selectedBusStop){
      name = selectedBusStop.name
      temperature = selectedBusStop.temperature
      peopleNumber = selectedBusStop.peopleNumber
      fullLevel = selectedBusStop.fullLevel
      location = selectedBusStop.location
      frequentTravelers =selectedBusStop.frequentTravelers
    }
    //Service Performance, Number of Passengers, Number of Frequent Travelers
    return (
      <div>
        { (selectedBusStop) ?
          <div>
            <Typography variant="h5" component="h2">
              {name}
            </Typography>

            <Row>
              <Col>
                <Typography color="textSecondary">
                  {`No. of Passengers : ${peopleNumber}`}
                </Typography>
              </Col>
              <Col>
                <Typography color="textSecondary">
                  {`No. of Frequent Travelers : ${frequentTravelers}`}
                </Typography>
              </Col>
            </Row>

            <Row>
              <Col>
                <Typography color="textSecondary">
                  {`Temperature : ${temperature}`}
                </Typography>
              </Col>
            </Row>

            <Row>
              <Col>
                <Typography color="textSecondary">
                  {`Last Update : ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`}
                </Typography>
              </Col>
            </Row>

            <div className='journeySet-table-container'>
              <div>
                Number of Frequent Travelers / Non-Frequent Travelers
                <ActiveShapePieChart
                  selectedBusStop = {selectedBusStop}
                />
              </div>

              <div>
                Number of Waiting Passengers (Predict / Actual)
                <BiaxialBarChart
                  selectedBusStop = {selectedBusStop}
                />
              </div>

              <div>
                Service Performance (Predict / Actual)
                <BiaxialLineChart
                  selectedBusStop = {selectedBusStop}
                />
              </div>

            </div>

          </div>
          :
          <div>
          </div>
        }
      </div>
    )
  }
}

export default withRouter(BusStopDetail);
