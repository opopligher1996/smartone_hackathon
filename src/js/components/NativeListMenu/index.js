import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import Input from '@material-ui/core/Input';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FilledInput from '@material-ui/core/FilledInput';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import NativeSelect from '@material-ui/core/NativeSelect';
import './styles.scss';

class NativeListMenu extends Component {

  renderOptions = () => {
    const { options } = this.props;
    return options.map(({ val, display }) => {
      return <option value={val}>{display}</option>;
    });
  }

  render() {
    const { name, field, val, handleChange } = this.props;
    const id = `${field}-select`;
    return (
      <FormControl>
        <InputLabel htmlFor={`${field}-select`}>{name}</InputLabel>
        <Select
          native
          value={val}
          onChange={handleChange(field)}
          inputProps={{
            name: field,
            id,
          }}
        >
          <option value="" />
          {this.renderOptions()}
        </Select>
      </FormControl>
    )
  }
}

export default NativeListMenu;