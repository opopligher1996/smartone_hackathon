import React, { Component } from 'react';
import { Container, Dropdown, Row, Col } from 'react-bootstrap';
import Button from '@material-ui/core/Button';
import './styles.scss';
import TextField from '@material-ui/core/TextField';
import ListMenu from '../../../../components/ListMenu';

class CreateTest extends Component {

  state = {
    name: '',
    description: '',
    route: '',
    seq: 0
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  saveTestCaseToDB = async () => {
    const { records } = this.props;
    const { name, description, route, seq } = this.state;
    const response = await fetch('http://localhost:3008/dashboard/storeTestCase', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: JSON.stringify({
        name,
        description,
        route,
        seq,
        records,
        timestamp: +new Date()
      })
    })
    .then(res => res.json());
    return response.response; //caseId
  }

  saveFeatureSetToDB = async (caseId) => {
    const { records } = this.props;
    const { journeyId } = records[0].currentState;
    const { name, description, route, seq } = this.state;
    fetch('http://localhost:3004/api/v2/training/storeJourneyFeatureSet', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        journeyId,
        caseId
      })
    });
  }

  saveDataToDB = async () => {
    const caseId = await this.saveTestCaseToDB();
    await this.saveFeatureSetToDB(caseId);
  }

  selectMenuItem = (key, val) => {
    this.setState({ [key]: val })
  }

  render() {
    const { records } = this.props;
    const routeOptions = [
      'Select the Route', '11', '11A', '11B', '11M', '11S', '12', '12A'
    ];
    const seqOptions = [
      'Select the Seq', null, 1, 2
    ];

    return (
      <div>
        <TextField
          id="name"
          label="Name"
          value={this.state.name}
          onChange={this.handleChange('name')}
          margin="normal"
          variant="outlined"
        /><br />
        <TextField
          id="outlined-textarea"
          label="Description"
          placeholder="Placeholder"
          multiline
          margin="normal"
          variant="outlined"
          onChange={this.handleChange('description')}
        /><br />
        <ListMenu 
          label={'Route'}
          options={routeOptions}
          selectMenuItem={(index) => this.selectMenuItem('route', routeOptions[index])}
        /><br/>
        <ListMenu 
          label={'Seq'}
          options={seqOptions}
          selectMenuItem={(index) => this.selectMenuItem('seq', seqOptions[index])}
        /><br/>
        <Button
          variant="contained"
          color="primary"
          onClick={this.saveDataToDB}
        >
          Save
        </Button>
      </div>
    )
  }
}

export default CreateTest;