import React, { Component } from 'react';
import { Button, Dropdown, Nav, Navbar, NavDropdown, Form, FormControl } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { withRouter } from "react-router-dom";
import icon from '../../../public/socif_icon.png';

class TopBar extends Component {

  handleLogin = () => {
    this.props.history.push('/login')
  }

  handleLogout = () => {
    this.props.removeAccount()
    this.props.history.push('/login')
  }

  render() {
    return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand>
          <img src={icon} style={{height:'5vh'}}/>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#dashboard">儀表板</Nav.Link>
            <Nav.Link href="#busStopReport">記錄</Nav.Link>
            <Nav.Link href="#customerStopReport">乘客記錄</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    )
  }
}

export default withRouter(TopBar);
