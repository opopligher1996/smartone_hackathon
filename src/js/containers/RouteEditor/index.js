import React, { Component } from 'react';
import { Map, InfoWindow, Marker, GoogleApiWrapper, Polyline } from 'google-maps-react';
import { Button, Dropdown } from 'react-bootstrap';
import RoutePerformance from '../RoutePerformance';
import { filter } from 'lodash';
import './styles.scss';
import { Checkbox, TextField } from '@material-ui/core';

class RouteEditor extends Component {
  render() {
    const { show, intervals, updateInterval, deleteInterval, insertInterval, insertFromIndex, insertMode, stopInsert, saveRoute } = this.props;

    return (
      <div className={'control_panel'} style={{ display: show ? 'block' : 'none' }}>
          <Button onClick={() => saveRoute()}>Confirm</Button><br/>
          <div className={"fix_head_table"}>
            <div className={"thead_table"}>
              <table className={"table_common"}>
                  <tbody>
                    <tr>
                        <th className={"col_2"}>
                          order
                        </th>
                        <th className={"col_2"}>
                          name
                        </th>
                        <th className={"col_1"}>
                          location
                        </th>
                        <th className={"col_2"}>
                          isStartReturning
                        </th>
                        <th className={"col_2"}>
                          critical
                        </th>
                        <th className={"col_1"}>
                          control
                        </th>
                    </tr>
                  </tbody>
              </table>
            </div>
            <div className={"tbody_table"}>
                <table className={"table_common"}>
                  <tbody>
                    {intervals.map((interval,index)=> (
                      <tr>
                          <td className={"col_2"}>
                            {index}
                          </td>
                          <td className={"col_2"}>
                            <TextField
                              id={`edit-${index}`}
                              label="Station name"
                              value={interval.name}
                              onChange={updateInterval('name', index)}
                              margin="normal"
                            />
                          </td>
                          <td className={"col_1"}>
                            x:{interval.location.lat}<br/>
                            y:{interval.location.lng}
                          </td>
                          <td className={"col_2"}>
                            <Checkbox
                              checked={interval.startReturning}
                              onChange={updateInterval('startReturning', index, 'checked')}
                              // value={`checked-${fsId}`}
                            />
                          </td>
                          <td className={"col_2"}>
                            <Checkbox
                              checked={interval.critical}
                              onChange={updateInterval('critical', index, 'checked')}
                              // value={`checked-${fsId}`}
                            />
                          </td>
                          <td className={"col_1"}>
                            {
                              insertMode && insertFromIndex === index ? 
                              <Button variant="danger" onClick={() => stopInsert()}>Stop Insert</Button> :
                              <Button variant="success" onClick={() => insertInterval(index)}>Insert</Button> 
                            }
                            <Button variant="danger" onClick={() => deleteInterval(index)}>Delete</Button><br/>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
    )
  }
}

export default RouteEditor;