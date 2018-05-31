import axios from 'axios';
import { buildVisualization, updateVisualization } from '../index';
import { acUpdateCurrentFleet, acInitialFleetLoaded } from '../store';

export function fetchFleetDataFromServer(carrierCode) {
  const fleet = [];
  const fleetOffChart = [];
  return axios
    .get(`/api/${carrierCode}`)
    .then(response => response.data)
    .then(aircraft => {
      for (const plane in aircraft) {
        const pComplete = aircraft[plane].flightPercentComplete;
        if (
          aircraft[plane].altitude &&
          !aircraft[plane].grounded &&
          pComplete &&
          pComplete > 0
        ) {
          fleet.push(aircraft[plane]);
        } else {
          fleetOffChart.push(aircraft[plane]);
        }
      }
      return [fleet, fleetOffChart];
    });
}

export function getInitialFleet(carrier, dispatch, queryIntervalId) {
  fetchFleetDataFromServer(carrier)
    .then(([fleet]) => {
      dispatch(acInitialFleetLoaded(fleet, queryIntervalId));
      buildVisualization(fleet);
    })
    .catch(err => console.log(err));
}

export function refreshFleetData(carrier, dispatch) {
  fetchFleetDataFromServer(carrier)
    .then(([fleet]) => {
      dispatch(acUpdateCurrentFleet(fleet));
      updateVisualization(fleet);
    })
    .catch(err => console.log(err));
}
