import React, { Component, PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import { TableRow, TableCell } from '@material-ui/core';
import { findIndex, forEach } from 'lodash';
import moment from 'moment';
import { BarChart, Bar, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Sector } from 'recharts';

const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const {
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value} People`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

class ActiveShapePieChart extends Component {

  state = {
    defaultBusStop: null,
    selectedBusStop: null,
    activeIndex: 0,
    data: [
      { name: 'Frequent', value: 400 },
      { name: 'Non-Frequent', value: 300 }
    ]
  }

  componentDidMount() {
    const selectedBusStop = this.props.selectedBusStop;
    console.log('selectedBusStop')
    console.log(selectedBusStop)
    const { peopleNumber, frequentTravelers} = selectedBusStop

    this.setState(
      {
        selectedBusStop: selectedBusStop,
        data: [
          { name: 'Frequent', value: frequentTravelers},
          { name: 'Non-Frequent', value: (peopleNumber-frequentTravelers)}
        ]
      }
    )
  }


  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index,
    });
  };

  render() {
    const {data} = this.state
    return (
      <PieChart width={400} height={200}>
        <Pie
          activeIndex={this.state.activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx={200}
          cy={100}
          innerRadius={50}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={this.onPieEnter}
        />
      </PieChart>
    );
  }
}

export default withRouter(ActiveShapePieChart);
