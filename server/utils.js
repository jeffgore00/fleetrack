const { promisify } = require('util');
const path = require('path');
const readFile = promisify(require('fs').readFile);

const airports = {};

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

async function getAirports() {
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

module.exports = { getAirports, readFile, createFleetFromAircraftList };
