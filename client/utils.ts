/* Code courtesy of https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */

export interface ReduxStore {
  carrier: string;
  fleet: Airplane[];
  queryIntervalId: number;
  getState: Function;
}

export interface Airplane {
  callsign: string;
  altitude: number;
  grounded: boolean;
  speed: number;
  lat: number;
  long: number;
  heading: number;
  aircraftType: string;
  airportFrom: Airport;
  airportTo: Airport;
  airportStops: Airport[];
  ageInYears: number;
  flightPercentComplete: number;
}

export interface Airport {
  code: string;
  lat: number;
  long: number;
  name: string;
  city: string;
  state: string;
  country: string;
}

export const numberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
/* */

export const getFirstCallsign = (reduxStore: ReduxStore): string => {
  const fleet = reduxStore.getState().fleet;
  return fleet[0] ? fleet[0].callsign.slice(0, 3) : "";
};
