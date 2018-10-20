/* Code courtesy of https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */

interface reduxStore {
  carrier: string;
  fleet: any[];
  queryIntervalId: number;
  getState: Function;
}

export const numberWithCommas = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
/* */

export const getFirstCallsign = (reduxStore: reduxStore): string => {
  const fleet = reduxStore.getState().fleet;
  return fleet[0] ? fleet[0].callsign.slice(0, 3) : "";
};
