import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

import './styles.scss';

class ListMenu extends Component {

  state = {
    anchorEl: null,
    selectedIndex: 0,
  };

  handleClickListItem = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleMenuItemClick = (event, index) => {
    const { selectMenuItem } = this.props;
    this.setState({ selectedIndex: index, anchorEl: null });
    selectMenuItem(index);
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };


  render() {
    const { anchorEl } = this.state;
    const { label, options } = this.props;

    return (
      <div>
        <List component="nav">
          <ListItem
            button
            aria-haspopup="true"
            aria-controls="lock-menu"
            aria-label={label}
            onClick={this.handleClickListItem}
          >
            <ListItemText
              primary={label}
              secondary={options[this.state.selectedIndex]}
            />
          </ListItem>
        </List>
        <Menu
          id="lock-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          {options.map((option, index) => (
            <MenuItem
              key={option}
              disabled={index === 0}
              selected={index === this.state.selectedIndex}
              onClick={event => this.handleMenuItemClick(event, index)}
            >
              {option}
            </MenuItem>
          ))}
        </Menu>
      </div>
    );
  }
}

export default ListMenu;