
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
const PieChart = require("react-chartjs").Pie;

import './styles.scss';
import Progress from '../Progress';

class TestResult extends Component {

  render() {
    const { total, pending, success, failed, threshold } = this.props;

    return (
      <div className='test-result'>
        <Progress 
          val={(total - pending)}
          total={total}
          name={'Total'}
          color="determine"
        />
        <Progress 
          val={success}
          total={total}
          name={'Success'}
          color="primary"
        />
        <Progress 
          val={failed}
          total={total}
          name={'Failed'}
          color="secondary"
        />
      </div>
    )
  }
}

export default TestResult;