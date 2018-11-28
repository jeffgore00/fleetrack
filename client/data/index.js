import axios from 'axios';
import buildVisualization from '../viz/buildViz';
import updateVisualization from '../viz/updateViz';
import {
  acUpdateCurrentFleet,
  acInitialFleetLoaded,
  acUserRequestRejected,
  acUserOverrideFailed
} from '../store';

export function fetchFleetDataFromServer(carrierCode, password) {
  console.log(password);
  if (password) {
    return axios
      .post(`/api/${carrierCode}`, { password })
      .then(response => response.data);
  } else {
    return axios.get(`/api/${carrierCode}`).then(response => response.data);
  }
}

export function getInitialFleet(carrier, dispatch, password) {
  return fetchFleetDataFromServer(carrier, password)
    .then(data => {
      if (data.msgType) {
        if (data.msgType === 'INITIAL_REQ_REJECTED') {
          dispatch(acUserRequestRejected());
        } else if (data.msgType === 'OVERRIDE_FAILED') {
          dispatch(acUserOverrideFailed());
        }
      } else {
        const [fleet] = splitFleetOnOffChart(data);
        dispatch(acInitialFleetLoaded(carrier, fleet));
        return buildVisualization(fleet);
      }
    })
    .catch(err => {
      // NO
      // NO
      // NO
      // NO
      // ADD 'error' slice of state instead.
      console.log(err);
    });
}

export function refreshFleetData(carrier, dispatch) {
  return fetchFleetDataFromServer(carrier)
    .then(response => {
      if (response.message) {
        dispatch(acUserRequestRejected());
      } else {
        const [fleet] = splitFleetOnOffChart(response);
        dispatch(acUpdateCurrentFleet(fleet));
        return updateVisualization(fleet);
      }
    })
    .catch(err => console.log(err));
}

export function splitFleetOnOffChart(aircraft) {
  const fleet = [];
  const fleetOffChart = [];
  for (const plane in aircraft) {
    const pComplete = aircraft[plane].flightPercentComplete;
    if (aircraft[plane].altitude && pComplete && pComplete > 0) {
      fleet.push(aircraft[plane]);
    } else {
      fleetOffChart.push(aircraft[plane]);
    }
  }
  return [fleet, fleetOffChart];
}
