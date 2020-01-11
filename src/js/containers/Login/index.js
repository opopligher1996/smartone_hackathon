import React, { Component } from 'react';
import { Button, Form, ControlLabel, Row, Col } from "react-bootstrap";
import { Bar } from 'react-chartjs-2';
import { forEach } from 'lodash';
import { filter } from 'lodash';
import history from '../../history';
import './styles.scss';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      password: '',
      errorMessage: ''
    };
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    const {id, password} = this.state
    console.log('id')
    console.log(id)
    const isValidAccount = this.props.isValidAccount(id, password)
    this.props.history.push('/dashboard')
  }

  renderServicePerformance = () => {
    const data = [
      {name: '8:00 - 9:00', percentage: 80},
      {name: '9:00 - 10:00', percentage: 70},
      {name: '10:00 - 11:00', percentage: 50},
      {name: '11:00 - 12:00', percentage: 56}
    ];
    return  (
      <BarChart width={1500} height={200} data={data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
         <CartesianGrid strokeDasharray="3 3"/>
         <XAxis dataKey="name"/>
         <YAxis/>
         <Tooltip/>
         <Legend />
         <Bar dataKey="percentage" fill="#82ca9d" />
      </BarChart>
    );
  }
  
  render() {
    return (
      <div className="login">
        <div className="login-padding-div">
          <div className="login-form">
            <div className="login-form-padding-div">
              <Form>
                <Form.Group controlId="id">
                  <Form.Label>帳戶</Form.Label>
                  <Form.Control
                    placeholder="輸入帳戶名稱"
                    value={this.state.id}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Form.Group controlId="password">
                  <Form.Label>密碼</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="輸入密碼"
                    value={this.state.password}
                    onChange={this.handleChange}
                  />
                </Form.Group>
                <Button
                  block
                  bsSize="large"
                  onClick={this.handleSubmit}
                >
                  登入
                </Button>
              </Form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
