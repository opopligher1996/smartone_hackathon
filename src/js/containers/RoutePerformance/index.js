import React, { Component } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { filter } from 'lodash';
import './styles.scss';

class RoutePerformance extends Component {

  state = {
    minibuses: [],
    matchingMinibuses: [],
    route: '',
    seq: '',
    license: '',
    performance: []
  }

  componentDidMount() {
    this.getAllMinibus();
  }

  getAllMinibus = async () => {
    const data = await fetch(`http://localhost:3002/api/v2/minibus/getAllMinibuses`);
    const results = await data.json();
    this.setState({ minibuses: results.response });
  }

  chooseRoute = (route, seq) => {
    this.setState({ route, seq });
    const { minibuses } = this.state;
    // if(minibuses.length > 0) {
    //   const matchingMinibuses = filter(minibuses, { currentState: { seq }, route });
    //   console.log('minibuses', minibuses);
    //   this.setState({ matchingMinibuses });
    // }
  }

  chooseMinibus = license => {
    this.setState({ license })
  }

  getIntervalsPerformance = async () => {
    const { route, seq, license } = this.state;
    this.setState({ loading: true });
    const data = await fetch(`http://localhost:3002/api/v2/test/intervalHitRate?route=${route}&seq=${seq}&license=${license}`);
    const results = await data.json();
    this.setState({ performance: results.response, loading: false });
  }

  render() {
    const { matchingMinibuses, minibuses, route, license, loading, performance } = this.state;
    return (
      <div className='route-performance'>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {route ? route : 'Choose Route'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => this.chooseRoute('11', 1)}>{'11 (彩虹->坑口)'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11', 2)}>{'11 (坑口->彩虹)'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11M', 1)}>{'11M (坑口->北閘)'}</Dropdown.Item>
            <Dropdown.Item onClick={() => this.chooseRoute('11M', 2)}>{'11M (北閘->坑口)'}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {license ? license : 'Choose Minibus'}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {
              minibuses.map(minibus => <Dropdown.Item onClick={() => this.chooseMinibus(minibus.license)}>{minibus.license}</Dropdown.Item>)
            }
          </Dropdown.Menu>
        </Dropdown>

        { loading ? <div>Loading...</div>: <Button onClick={() => this.getIntervalsPerformance()}>Get intervals performance</Button>}

        <div className='performance-list'>
          {
            performance.map((interval, index) => <div>{`${interval.order} ${ !!interval.name && interval.name }: ${interval.hit}`}</div>)
          }
        </div>
      </div>
    )
  }
}

export default RoutePerformance;
