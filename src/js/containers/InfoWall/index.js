import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import './styles.scss';
import RecordBlock from '../../components/RecordBlock';
import ActiveMinibusBlock from '../../components/ActiveMinibusBlock';
import ActiveJourneyBlock from '../../components/ActiveJourneyBlock';
import MapBlock from '../../components/MapBlock';

class InfoWall extends Component {

  render() {
   
    return (
      <div>
        <Row>
          <Col sm={4} className='container'>
            <RecordBlock />
          </Col>
          <Col sm={4} className='container'>
            <ActiveMinibusBlock bgColor={'#2874A6'} />
          </Col>
          <Col sm={4} className='container'>
            <ActiveJourneyBlock bgColor={'#770063'} />
          </Col>
        </Row>
        <Row>
          <Col sm={8}>
            <MapBlock />
          </Col>
          <Col sm={4}>sm=true</Col>
        </Row>
      </div>
    )
  }
}

export default InfoWall;