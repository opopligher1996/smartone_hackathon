import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import './styles.scss';
import Block from '../Block';

class ActiveMinibusBlock extends Component {
  state = {
    activeMinibuses: [],
    total: 0
  }

  componentDidMount() {
    this.getActiveMinibusInfo();
  }

  getActiveMinibusInfo = async () => {
    const response = await fetch('http://localhost:3008/dashboard/getActiveMinibuses')
    .then(response => response.json());
    this.setState({ 
      activeMinibuses: response.response.activeMinibuses,
      total: response.response.total
    });
  }

  render() {
    const { activeMinibuses, total } = this.state;
    const { bgColor } = this.props;
    return (
      <Block 
        title={'Active Minibus(es)'} 
        val={`${activeMinibuses.length}/${total}`} 
        bgColor={bgColor} 
        loading={!total}>
        {
          activeMinibuses.map(({ _id: journeyId ,license, route, seq, lastUpdate }, index) => {
            return (
              <div key={`journey-${index}`}>
                <b>{license}</b>({journeyId}): <b>{new Date(lastUpdate).toLocaleTimeString()}</b>
                <div>route: {route}, seq: {seq}</div>
              </div>
            )
          })
        }
      </Block>
    )
  }
}

export default ActiveMinibusBlock;

