import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

import './styles.scss';

class Progress extends Component {

  render() {
    const { val, total, name, color } = this.props;

    return (
      <div className='circle-stat'>
        <div className='percentage'>{Math.round(val/total * 100)}%</div>
        <CircularProgress
          className={'progress'}
          color={color}
          variant="static"
          value={val/total * 100}
          size={100}
        />
        <div className='stat-number'>{name}: <br />{`${val}/${total}`}</div>
      </div>
    )
  }
}

export default Progress;