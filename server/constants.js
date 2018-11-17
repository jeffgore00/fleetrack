// The maximum number of aircraft in a FlightAware API result set to count
// as one billing "query". If you want more than 15 aircraft then you will be
// billed for Math.ceil(actual number of aircraft returned / 15).
const FA_AIRCRAFT_QUERY_LIMIT = 15;
const MAX_AIRCRAFT_PER_FLEET_QUERY = 15; // SHOULD BE 500
const JG_MONTHLY_QUERY_LIMIT = 415;
const EST_QUERIES_PER_FLEET = 25;

module.exports = {
  FA_AIRCRAFT_QUERY_LIMIT,
  MAX_AIRCRAFT_PER_FLEET_QUERY,
  JG_MONTHLY_QUERY_LIMIT,
  EST_QUERIES_PER_FLEET
};
