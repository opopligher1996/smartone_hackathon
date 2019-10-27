
import React, { Component } from 'react';
import moment from 'moment';
import './styles.scss';

class Timer extends Component {

  state = {
    timeInMSec: 0
  }

  componentDidMount() {
    const { startTime } = this.props;
    this.timer = setInterval(() => {
      const currentTime = +new Date();
      this.setState({ timeInMSec: currentTime-startTime });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    this.timer = null;
  }

  render() {
    const { timeInMSec } = this.state;

    return (
      <div className='timer'>
        {moment.utc(timeInMSec).format('HH:mm:ss')}
      </div>
    )
  }
}

export default Timer;