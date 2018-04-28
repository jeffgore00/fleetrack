import axios from 'axios';

let fleet = {};
let fleetOffChart = {};

axios.get('/api/DAL')
  .then(response => response.data)
  .then(aircraft => {
    for (const plane in aircraft) {
      const pComplete = aircraft[plane].flightPercentComplete;
      if (pComplete && pComplete > 0) {
        fleet[plane] = aircraft[plane];
      } else {
        fleetOffChart[plane] = aircraft[plane];
      }
    }
    return fleet;
  });