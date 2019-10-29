import React, { Component } from 'react';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import BusStopBadge from '../BusStopBadge';
import Timer from '../Timer';
import LiveBadge from '../LiveBadge';
import BusStopLiveBadge from '../BusStopLiveBadge';

class BusStopCard extends Component {
  render() {
    const { busStop } = this.props;
    const { id, name, location, temperature, peopleNumber } = busStop;
    return (
      <Card className='minibus-card'>
        <CardContent>
          <Row>
            <Col md={3}>
              <BusStopBadge />
              {name}
            </Col>
            <Col md={9}>
              <BusStopLiveBadge busStop={busStop} />
              <Typography variant="body1">
                {`Number of Passengers: ${peopleNumber}`}
              </Typography>
              <Typography variant="body1">
                {`Temperature : ${temperature}`}
              </Typography>
              <Typography variant="body1">
                {`Co2: 10`}
              </Typography>
              <Typography variant="body2" component="p">
                {`PM 2.5： 5.0`}
              </Typography>
            </Col>
          </Row>
        </CardContent>
      </Card>
    )
  }
}

export default BusStopCard;
