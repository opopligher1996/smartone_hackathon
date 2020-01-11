import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import moment from 'moment';


class BiaxialBarChart extends PureComponent {

  state = {
    defaultBusStop: null,
    selectedBusStop: null,
    activeIndex: 0,
    data : [
      {
        name: '09:00', Actual: 40, Predict: 24, amt: 2400,
      },
      {
        name: '10:00', Actual: 30, Predict: 13, amt: 2210,
      },
      {
        name: '11:00', Actual: 20, Predict: 98, amt: 2290,
      },
      {
        name: '12:00', Actual: 27, Predict: 39, amt: 2000,
      }
    ]
  }

  componentDidMount() {
    const selectedBusStop = this.props.selectedBusStop;
    const { peopleNumber, frequentTravelers, waitingPassengersCount} = selectedBusStop

    const now = moment()
    console.log(now)
    now.subtract(3, "hours")
    this.setState(
      {
        selectedBusStop: selectedBusStop,
        data : [
          {
            name: now.add(1, "hours").format("HH:00"), Actual: waitingPassengersCount[0].actualPeopleCount, Predict: waitingPassengersCount[0].predictPeopleCount, amt: 2400,
          },
          {
            name: now.add(1, "hours").format("HH:00"), Actual: waitingPassengersCount[1].actualPeopleCount, Predict: waitingPassengersCount[1].predictPeopleCount, amt: 2210,
          },
          {
            name: now.add(1, "hours").format("HH:00"), Actual: waitingPassengersCount[2].actualPeopleCount, Predict: waitingPassengersCount[2].predictPeopleCount, amt: 2290,
          },
          {
            name: now.add(1, "hours").format("HH:00"), Actual: 0, Predict: waitingPassengersCount[3].predictPeopleCount, amt: 2000,
          }
        ]
      }
    )
  }

  render() {
    const {data} = this.state

    return (
      <BarChart
        width={500}
        height={200}
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Bar yAxisId="left" dataKey="Actual" fill="#8884d8" />
        <Bar yAxisId="right" dataKey="Predict" fill="#82ca9d" />
      </BarChart>
    );
  }
}

export default withRouter(BiaxialBarChart);
