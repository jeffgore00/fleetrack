import axios from 'axios';

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
