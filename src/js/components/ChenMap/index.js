import React, { Component } from 'react';
import { GoogleMap, Marker, withGoogleMap, OverlayView } from "react-google-maps";

const ChenMap = withGoogleMap(props => {
  return (
    <GoogleMap
      defaultZoom={14}
      defaultCenter={{ lat: 22.334949, lng: 114.235340 }}
    >
      {props.children}
    </GoogleMap>
  )
});

export default ChenMap;
