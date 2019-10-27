import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import './styles.scss';
import Block from '../Block';

class ActiveJourneyBlock extends Component {
  state = {
    activeJourneys: [],
    total: 0
  }

  componentDidMount() {
    this.getActiveJourneyInfo();
  }

  getActiveJourneyInfo = async () => {
    const response = await fetch('http://localhost:3008/dashboard/getActiveJourneys')
    .then(response => response.json());
    this.setState({ 
      activeJourneys: response.response.activeJourney,
      total: response.response.total
    });
  }

  render() {
    const { activeJourneys, total } = this.state;
    const { bgColor } = this.props;
    return (
      <Block 
        title={'Active Journey(s)'} 
        val={`${activeJourneys.length}/${total}`} 
        bgColor={bgColor}
        loading={!total}
        >
        {
          activeJourneys.map(({ _id: journeyId ,license, route, seq, startTime }, index) => {
            return (
              <div key={`journey-${index}`}>
                <b>{license}</b>({journeyId}): <b>{new Date(startTime).toLocaleTimeString()}</b>
                <div>route: {route}, seq: {seq}</div>
              </div>
            )
          })
        }
      </Block>
    )
  }
}

export default ActiveJourneyBlock;

