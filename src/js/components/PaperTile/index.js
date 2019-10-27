import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import './styles.scss';

class PaperTile extends Component {
  render() {
    const { title, content } = this.props;
    return (
      <Paper className='paper-tile' elevation={1}>
        <Typography variant="h5" component="h5">
          {title}
        </Typography>
        <Typography component="p">
          {content}
        </Typography>
      </Paper>
    )
  }
}

export default PaperTile;