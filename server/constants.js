// The maximum number of aircraft in a FlightAware API result set to count
// as one billing "query". If you want more than 15 aircraft then you will be
// billed for Math.ceil(actual number of aircraft returned / 15).
const FA_AIRCRAFT_QUERY_LIMIT = 15;

module.exports = {
  FA_AIRCRAFT_QUERY_LIMIT
};
