import React, { Component } from 'react';
import { Button, Container, Dropdown, Row, Col } from 'react-bootstrap';
import BarLoader from 'react-spinners/BarLoader';
import './styles.scss';

class Block extends Component {
  render() {
    const { title, val, bgColor, children, noPadding, loading } = this.props;
    console.log('bgColor', bgColor);
    return (
      <div className={`block`} style={
        Object.assign({}, { backgroundColor: bgColor }, noPadding && { padding: 0 })}>
        {
          (title || val) &&
          <div className='main-stat'>
            <b>{title}</b><br />
            <b>{val}</b>
          </div>
        }
        {
          loading ? 
          <BarLoader
              // css={override}
              sizeUnit={"px"}
              size={150}
              color={'#123abc'}
              loading={loading}
            /> :
            <div className={`detail ${noPadding ? 'no-margin' : ''}`}>
            {children}
          </div>
        }
        
      </div>
    )
  }
}

export default Block;