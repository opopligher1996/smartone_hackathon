import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import './styles.scss';
import Block from '../Block';

class RecordBlock extends Component {
  state = {
    journeysInfo: [],
    totalRecords: 0
  }

  componentDidMount() {
    this.getJourneysInfo();
  }

  getJourneysInfo = async () => {
    const response = await fetch('http://localhost:3008/dashboard/getNumberOfRecordsInJourneys')
    .then(response => response.json());
    this.setState({ journeysInfo: response.response }, () => this.getTotalRecordNum());
  }

  getTotalRecordNum = () => {
    const { journeysInfo } = this.state;
    let count = 0;
    for(let i = 0; i < journeysInfo.length; i++) {
      count += journeysInfo[i].num;
    }
    this.setState({ totalRecords: count });
  }

  render() {
    const { journeysInfo, totalRecords } = this.state;
    return (
      <Block title={'Total Record(s)'} val={totalRecords} loading={!journeysInfo.length}>
        {
          journeysInfo.map(({ _id: journeyId ,license, num, route, seq }, index) => {
            return (
              <div key={`journey-${index}`}>
                <b>{license}</b>({journeyId}): <b>{num}</b>
                <div>route: {route}, seq: {seq}</div>
              </div>
            )
          })
        }
      </Block>
    )
  }
}

export default RecordBlock;

