import React, { Component } from 'react';
import { orderBy, find, findIndex, remove, indexOf, uniqBy } from 'lodash';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import { Checkbox, FormControlLabel } from '@material-ui/core';

class CheckboxList extends Component {

  renderCheckboxs = () => {
    const { settings, handleCheck } = this.props;
    return settings.map(({ key, label, checked }) => {
      return (
        <Col>
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                onChange={handleCheck(key)}
                // value={`checked-${fsId}`}
              />
            }
            label={label}
          />
        </Col>
      )
    })
  }

  render() {
    return (
      <Row>
        {this.renderCheckboxs()}
      </Row>
    )
  }
}

export default CheckboxList;