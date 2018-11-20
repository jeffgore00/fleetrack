const { promisify } = require('util');
const path = require('path');
const readFile = promisify(require('fs').readFile);

const {
  EST_QUERIES_PER_FLEET,
  JG_MONTHLY_QUERY_LIMIT,
  FA_AIRCRAFT_QUERY_LIMIT
} = require('./constants');
const { Query } = require('./db/models');

const airports = {};

const overrideCodeValid = override =>
  override && override === process.env.OVERRIDE_AUTH_CODE;

const queryExceedsLimit = queryCount =>
  queryCount + EST_QUERIES_PER_FLEET > JG_MONTHLY_QUERY_LIMIT;

const configureFlightXMLRequest = (
  apiURI,
  carrierCode,
  user,
  pass,
  queryLimit
) => ({
  // Note that FlightInfoEx (as opposed to SearchBirdseyeInFlight) has
  // some extra data (i.e. estimated arrival time and route), but would
  // require you to make individual queries for every one of the aircraft.
  // Technically it returns an array but that's if it finds multiple
  // results; it doesn't support wildcards nor does it have a `query`.
  uri: `${apiURI}SearchBirdseyeInFlight?query={match ident ${carrierCode}*} {true inAir}&howMany=${queryLimit}`,
  auth: {
    user,
    pass
  }
});

function getAirportDetails(icao, airportList) {
  if (airportList[icao]) return airportList[icao];
}

/* Below courtesy of https://stackoverflow.com/a/365853 */
function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceInMilesBetweenEarthCoordinates({ lat1, lon1, lat2, lon2 }) {
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c * 0.621371;
}
/* Above courtesy of https://stackoverflow.com/a/365853 */

function buildCoordinateObj(aircraft, fromPoint) {
  const coordinates = {
    lat2: aircraft.airportTo ? aircraft.airportTo.lat : undefined,
    lon2: aircraft.airportTo ? aircraft.airportTo.long : undefined
  };
  if (fromPoint === 'airport') {
    return Object.assign({}, coordinates, {
      lat1: aircraft.airportFrom ? aircraft.airportFrom.lat : undefined,
      lon1: aircraft.airportFrom ? aircraft.airportFrom.long : undefined
    });
  } else if (fromPoint === 'aircraft') {
    return Object.assign({}, coordinates, {
      lat1: aircraft.lat,
      lon1: aircraft.long
    });
  }
}

function allCoordinatesTruthy({ lat1, lon1, lat2, lon2 }) {
  return lat1 && lon1 && lat2 && lon2;
}

function getJourneyPercentageComplete(portToPort, planeToPort) {
  return (
    (1 -
      distanceInMilesBetweenEarthCoordinates(planeToPort) /
        distanceInMilesBetweenEarthCoordinates(portToPort)) *
    100
  );
}

async function loadAirportFile() {
  try {
    const data = await readFile(
      path.join(__dirname, '../sources/airports.json'),
      'utf-8'
    );
    JSON.parse(data).forEach(airport => {
      airports[airport.icao] = {
        code: airport.code,
        lat: Number(airport.lat),
        long: Number(airport.lon),
        name: airport.name,
        city: airport.city,
        state: airport.state,
        country: airport.country
      };
    });
  } catch (err) {
    console.log(err);
  }
}

function createFleetFromAircraftList(aircraftList) {
  const fleet = {};
  for (let i = 0; i < aircraftList.length; i++) {
    fleet[aircraftList[i].ident] = {
      callsign: aircraftList[i].ident,
      altitude: aircraftList[i].altitude * 100,
      speed: aircraftList[i].groundspeed,
      lat: aircraftList[i].latitude,
      long: aircraftList[i].longitude,
      heading: aircraftList[i].heading,
      aircraftType: aircraftList[i].type,
      airportFrom: aircraftList[i].origin
        ? getAirportDetails(aircraftList[i].origin, airports)
        : undefined,
      airportTo: aircraftList[i].destination
        ? getAirportDetails(aircraftList[i].destination, airports)
        : undefined
    };
  }
  for (const plane in fleet) {
    const airportToAirportCoords = buildCoordinateObj(fleet[plane], 'airport');
    const aircraftToAirportCoords = buildCoordinateObj(
      fleet[plane],
      'aircraft'
    );
    if (
      allCoordinatesTruthy(airportToAirportCoords) &&
      allCoordinatesTruthy(aircraftToAirportCoords)
    ) {
      fleet[plane].flightPercentComplete = getJourneyPercentageComplete(
        airportToAirportCoords,
        aircraftToAirportCoords
      );
    }
  }
  return fleet;
}

function handleFlightXMLResponse(apiErr, apiRes, apiBody, req, res, next) {
  try {
    if (apiErr) {
      res
        .status(500)
        .send('There was a problem getting data from the FlightAware server.');
    } else {
      const { SearchBirdseyeInFlightResult } = JSON.parse(apiBody);
      const aircraft = SearchBirdseyeInFlightResult.aircraft;
      res.send(createFleetFromAircraftList(aircraft));
      Query.create({
        carrier: req.params.airline,
        resultCount: aircraft.length,
        limit: FA_AIRCRAFT_QUERY_LIMIT
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  loadAirportFile,
  readFile,
  createFleetFromAircraftList,
  configureFlightXMLRequest,
  queryExceedsLimit,
  handleFlightXMLResponse,
  overrideCodeValid
};
