import React, { Component } from 'react';
import { orderBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import './styles.scss';
import { TextField, Button } from '@material-ui/core';
import ListMenu from '../../../../components/ListMenu';

class CreateLiveTest extends Component {

  render() {
    const { id, handleChange, name, description, switchRoute } = this.props;
    const options = [
      'Please select route',
      '11',
      '11A',
      '11B',
      '11M',
      '11S',
      '12',
      '12A',
    ];

    return (
      <div>
        <div>Test No.: {id}</div>
        <TextField
          id="outlined-name"
          label="Name"
          value={name}
          onChange={handleChange('name')}
          margin="normal"
          variant="outlined"
        /><br />
        <TextField
          id="outlined-description"
          label="Description"
          value={description}
          onChange={handleChange('description')}
          margin="normal"
          variant="outlined"
          multiline
          rowsMax="4"
        />
        <ListMenu 
          label={'Select Route'}
          options={options}
          selectMenuItem={(index) => switchRoute(options[index])}
        />
        {/* <div>Please click on the map to locate the starting point</div>
        <div>{`${startingPoint.lat}, ${startingPoint.lng}`}</div> */}
      </div>
    )
  }
}

export default CreateLiveTest;