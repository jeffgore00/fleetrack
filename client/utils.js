/* Code courtesy of https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript */
export const numberWithCommas = num => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
/* */

export const getFirstCallsign = reduxStore => {
  const fleet = reduxStore.getState().fleet;
  return fleet[0] ? fleet[0].callsign.slice(0, 3) : '';
};
