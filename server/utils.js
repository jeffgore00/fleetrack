
const request = require('request-promise-native');
const airportListURI = 'https://gist.githubusercontent.com/tdreyno/4278655/raw/7b0762c09b519f40397e4c3e100b097d861f5588/airports.json';

let airports = {};

function getAirportDetails(code, airportList) {
  if(airportList[code]) return airportList[code];
}

/* Below courtesy of https://stackoverflow.com/a/365853 */
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function distanceInMilesBetweenEarthCoordinates({lat1, lon1, lat2, lon2}) {
  var earthRadiusKm = 6371;

  var dLat = degreesToRadians(lat2-lat1);
  var dLon = degreesToRadians(lon2-lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return (earthRadiusKm * c) * 0.621371;
}
/* Above courtesy of https://stackoverflow.com/a/365853 */

function buildCoordinateObj(aircraft, fromPoint) {
  const coordinates = {
    lat2: aircraft.airportTo ? aircraft.airportTo.lat : undefined,
    lon2: aircraft.airportTo ? aircraft.airportTo.long : undefined,
  };
  if (fromPoint === 'airport') {
    return Object.assign({}, coordinates, {
      lat1: aircraft.airportFrom ? aircraft.airportFrom.lat : undefined,
      lon1: aircraft.airportFrom ? aircraft.airportFrom.long : undefined,
    });
  } else if (fromPoint === 'aircraft') {
    return Object.assign({}, coordinates, {
      lat1: aircraft.lat,
      lon1: aircraft.long,
    });
  };
}

function allCoordinatesTruthy({lat1, lon1, lat2, lon2}) {
  return lat1 && lon1 && lat2 & lon2;
}

function getJourneyPercentageComplete(portToPort, planeToPort) {
  return 1 - (distanceInMilesBetweenEarthCoordinates(planeToPort) / distanceInMilesBetweenEarthCoordinates(portToPort));
}

const utils = {

  getAirports() {
    return request(
      airportListURI, 
      (apiErr, apiRes, apiBody) => {
        if (apiErr) throw apiErr;
        JSON.parse(apiBody).forEach(airport => {
          airports[airport.icao] = {
            code: airport.icao,
            lat: Number(airport.lat),
            long: Number(airport.lon),
            name: airport.name,
            city: airport.city,
            state: airport.state,
            country: airport.country,
          };
        });
      });
  },

  createFleetFromAircraftList(aircraftList) {
    const fleet = {};
    for (let i = 0; i < aircraftList.length; i++) {
      fleet[aircraftList[i].Call] = {
        altitude: aircraftList[i].Alt, // altitude
        altitudeTarget: aircraftList[i].tAlt, // target altitude
        speed: aircraftList[i].Spd,
        lat: aircraftList[i].Lat,
        long: aircraftList[i].Long,
        trackAngle: aircraftList[i].Trak,
        aircraftType: aircraftList[i].Type,
        airportFrom: aircraftList[i].From ? getAirportDetails(aircraftList[i].From.slice(0,4), airports) : undefined,
        airportTo: aircraftList[i].To ? getAirportDetails(aircraftList[i].To.slice(0,4), airports) : undefined,
        airportStops: aircraftList[i].Stops ? aircraftList[i].Stops.map(stop => getAirportDetails(stop.slice(0,4), airports)) : undefined, 
        ageInYears: aircraftList[i].Year ? (new Date()).getFullYear() - aircraftList[i].Year : undefined
      };
    }
    for (const plane in fleet) {
      const airportToAirportCoords = buildCoordinateObj(fleet[plane], 'airport');
      const aircraftToAirportCoords = buildCoordinateObj(fleet[plane], 'aircraft');
      if (allCoordinatesTruthy(airportToAirportCoords) && allCoordinatesTruthy(aircraftToAirportCoords)) {
        fleet[plane].flightPercentComplete = getJourneyPercentageComplete(airportToAirportCoords, aircraftToAirportCoords);
      }
    }
    return fleet;
  }

};

module.exports = utils;