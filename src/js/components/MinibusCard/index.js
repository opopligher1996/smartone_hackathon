import React, { Component } from 'react';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import './styles.scss';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import MinibusBadge from '../MinibusBadge';
import Timer from '../Timer';
import LiveBadge from '../LiveBadge';

class MinibusCard extends Component {
  render() {
    const { minibus } = this.props;
    const { license, currentState, lastUpdate, route, hardwareId, batteryLeft } = minibus;
    const { journeyStartTime, seq, interval, journeyId, passedStation } = currentState;
    const currentTime = +new Date();
    const isMinibusOnline = (currentTime - lastUpdate) < 5*1000*60;

    return (
      <Card className='minibus-card'>
        <CardContent>
          <Row>
            <Col md={3}>
              <MinibusBadge license={license} />
              {
                isMinibusOnline && journeyStartTime &&
                <Timer
                  startTime={journeyStartTime}
                />
              }
            </Col>
            <Col md={9}>
              <LiveBadge online={isMinibusOnline} />
              <Typography color="textSecondary" gutterBottom>
                {`最後更新: ${`${new Date(lastUpdate).toLocaleDateString()} ${new Date(lastUpdate).toLocaleTimeString()}`}`}
              </Typography>
              <Typography variant="body1">
                {`路線: ${route}`}
              </Typography>
              <Typography variant="body1">
                {`seq: ${seq}`}
              </Typography>
              <Typography variant="body2" component="p">
                {`已過車站: ${passedStation}`}
              </Typography>
              <Typography variant="body1">
                {`電量: ${batteryLeft}`}
              </Typography>
              <Typography variant="body1">
                {`HardwareId: ${hardwareId}`}
              </Typography>
            </Col>
          </Row>
        </CardContent>
      </Card>
    )
  }
}

export default MinibusCard;
