// The maximum number of aircraft in a FlightAware API result set to count
// as one billing "query". If you want more than 15 aircraft then you will be
// billed for Math.ceil(actual number of aircraft returned / 15).
const FA_BILLING_QUERY_SIZE = 15;
const JG_RESULT_SIZE_LIMIT = 15; // SHOULD BE 500
const JG_MONTHLY_QUERY_LIMIT = 415;
const EST_QUERIES_PER_FLEET = 25;
const API_SERVER_URI = 'https://flightxml.flightaware.com/json/FlightXML2/';

module.exports = {
  FA_BILLING_QUERY_SIZE,
  JG_RESULT_SIZE_LIMIT,
  JG_MONTHLY_QUERY_LIMIT,
  EST_QUERIES_PER_FLEET,
  API_SERVER_URI
};
