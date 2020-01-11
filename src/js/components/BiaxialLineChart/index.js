import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import moment from 'moment';


class BiaxialLineChart extends PureComponent {

  state = {
    defaultBusStop: null,
    selectedBusStop: null,
    activeIndex: 0,
    data : [
      {
        name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
      },
      {
        name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
      },
      {
        name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
      },
      {
        name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
      }
    ]
  }

  componentDidMount() {
    const selectedBusStop = this.props.selectedBusStop;
    const { peopleNumber, frequentTravelers, waitingPassengersCount, waitingTime} = selectedBusStop

    console.log('selectedBusStop')
    console.log(selectedBusStop)
    const now = moment()
    console.log(now)
    now.subtract(3, "hours")
    this.setState(
      {
        selectedBusStop: selectedBusStop,
        data : [
          {
            name: now.add(1, "hours").format("HH:00"), Actual: waitingTime[0].predictTime, Predict: waitingTime[0].actucalTime, amt: 2400,
          },
          {
            name: now.add(1, "hours").format("HH:00"), Actual: waitingTime[1].predictTime, Predict: waitingTime[1].actucalTime, amt: 2210,
          },
          {
            name: now.add(1, "hours").format("HH:00"), Actual: waitingTime[2].predictTime, Predict: waitingTime[2].actucalTime, amt: 2290,
          },
          {
            name: now.add(1, "hours").format("HH:00"), Actual: 0, Predict: waitingTime[3].actucalTime, amt: 2000,
          }
        ]
      }
    )
  }

  render() {
    const {data} = this.state
    return (
      <LineChart
        width={500}
        height={200}
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Line yAxisId="left" type="monotone" dataKey="Actual" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line yAxisId="right" type="monotone" dataKey="Predict" stroke="#82ca9d" />
      </LineChart>
    );
  }

}

export default withRouter(BiaxialLineChart);
