import React, { Component } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { forEach } from 'lodash';

class ETAPanel extends Component {

  state = {
    route: '11M',
    seq: 1,
    weekday: null,
    hour: null,
    etaSet: {
      journeyTime: 0,
      etaIntervalSet: []
    },
    allJourneyStats: [],
    etaDeviation: []
  }

  computeETAInfo = async () => {
    const { route, seq, weekday, hour } = this.state;
    const data = await fetch(`http://localhost:3002/api/v2/training/computeETAInfo?route=${route}&seq=${seq}`);
    const results = await data.json();
    const allJourneyStats = await fetch(`http://localhost:3002/api/v2/training/getStatForJourneys?route=${route}&seq=${seq}`);
    const stats = await allJourneyStats.json();
    this.setState({ etaSet: results.response, allJourneyStats: stats.response });
  }

  computeETADeviation = async () => {
    const { route, seq, weekday, hour } = this.state;
    console.log('url', `http://localhost:3002/api/v2/training/computeETADeviation?route=${route}&seq=${seq}${ hour ? `&hour=${hour}` : ''}${ weekday ? `&weekday=${weekday}` : ''}`);
    const data = await fetch(`http://localhost:3002/api/v2/training/computeETADeviation?route=${route}&seq=${seq}${ hour ? `&hour=${hour}` : ''}${ weekday ? `&weekday=${weekday}` : ''}`);
    const etaDeviation = await data.json();
    this.setState({ etaDeviation: etaDeviation.response });
  }

  renderHourItems = () => {
    let dom = [];
    for(let i = 0; i < 24; i++) {
      dom.push(<Dropdown.Item onClick={() => this.setState({ hour: i })}>{i}</Dropdown.Item>)
    }
    return dom;
  }

  renderETAIntervals = () => {
    const { etaSet } = this.state;
    return etaSet.etaIntervalSet.map((interval, index) => {
      if(index === 0)
        return <div>{`From: ${interval.from} ----- ${interval.time} ----- To: ${interval.to}`}</div>
      return <div>{`----- ${interval.time} ----- To: ${interval.to}`}</div>
    })
  }

  renderChart = () => {
    const { etaSet, allJourneyStats } = this.state;
    const { etaIntervalSet } = etaSet;
    const labels = etaIntervalSet.map(interval => `${interval.from}-${interval.to}`);
    const rawData = etaIntervalSet.map(interval => interval.time);
    let datasets = [
      {
        label: "Base",
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: rawData
      },
    ];
    forEach(allJourneyStats, (stat, index) => {
      datasets.push({
        label: index,
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: stat.etaIntervalSet.map(interval => interval.time)
      })
    });
    const data = {
      labels,
      datasets
    }

    return <Bar
    	data={data}
    	width={300}
    	height={100}
    	options={{
    		maintainAspectRatio: true,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    max: 200,    // minimum will be 0, unless there is a lower value.
                }
            }]
        }
    	}}
    />
  }

  renderDeviationChart = () => {
    const { etaDeviation } = this.state;
    console.log('etaDeviation', etaDeviation);
    if(etaDeviation.length === 0)
      return;
    let datasets = [];
    const labels = etaDeviation[0].map(deviation => `${deviation.from}-${deviation.to}`)
    forEach(etaDeviation, (deviationSet, index) => {
      datasets.push({
        label: index,
        fillColor: "rgba(220,220,220,0.5)",
        strokeColor: "rgba(220,220,220,0.8)",
        highlightFill: "rgba(220,220,220,0.75)",
        highlightStroke: "rgba(220,220,220,1)",
        data: deviationSet.map(deviation => deviation.time)
      })
    });
    const data = {
      labels,
      datasets
    }

    return <Bar
    	data={data}
    	width={300}
    	height={150}
      options={{
    		maintainAspectRatio: true,
        responsive: true,
        scaleBeginAtZero: false,
        scales: {
            yAxes: [{
                display: true,
                ticks: {
                    beginAtZero:true,
                    max: 200,    // minimum will be 0, unless there is a lower value.
                    min: -50,
                }
            }]
        }
    	}}
    />
  }

  render() {
    const { route, seq, weekday, hour, etaSet } = this.state;
    return (
      <div>
        <div>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {`Route: ${route} Seq: ${seq}`}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => this.setState({ route: '11', seq: 1 })}>{'11 (彩虹->坑口)'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ route: '11', seq: 2 })}>{'11 (坑口->彩虹)'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ route: '11M', seq: 1 })}>{'11M (坑口->北閘)'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ route: '11M', seq: 2 })}>{'11M (北閘->坑口)'}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Weekday: {weekday !== null ? weekday : 'Choose Weekday'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => this.setState({ weekday: 0 })}>{'星期日'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ weekday: 1 })}>{'星期一'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ weekday: 2 })}>{'星期二'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ weekday: 3 })}>{'星期三'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ weekday: 4 })}>{'星期四'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ weekday: 5 })}>{'星期五'}</Dropdown.Item>
              <Dropdown.Item onClick={() => this.setState({ weekday: 6 })}>{'星期六'}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Hour: {hour !== null ? hour : 'Choose Hour'}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {this.renderHourItems()}
            </Dropdown.Menu>
          </Dropdown>
          {this.renderETAIntervals()}
          <Button onClick={() => this.computeETAInfo()}>Compute ETA Only</Button>
          <Button onClick={() => this.computeETADeviation()}>Compute ETA Deviation</Button>
          {this.renderChart()}
          {this.renderDeviationChart()}
        </div>
        <div>

        </div>
      </div>
    )
  }
}

export default ETAPanel;
