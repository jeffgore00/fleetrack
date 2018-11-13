'use strict';
const router = require('express').Router();
const request = require('request');
const path = require('path');
const { createFleetFromAircraftList, readFile } = require('../utils');
const radarServerURI = 'https://flightxml.flightaware.com/json/FlightXML2/';

router.get('/:airline', async (req, res, next) => {
  if (process.env.NODE_ENV === 'testing') {
    const dummyData = await readFile(
      path.join(__dirname, '../../test/dummy/dummyFleet_DAL_FA.json'),
      'utf-8'
    );
    res.send(createFleetFromAircraftList(JSON.parse(dummyData)));
  } else {
    request(
      {
        // Note that FlightInfoEx (as opposed to SearchBirdseyeInFlight) has
        // more data you want (i.e. estimated arrival time and route), but would
        // require you to make individual queries for every one of the aircraft.
        // Technically it returns an array but that's if it finds multiple
        // results; it doesn't support wildcards nor does it have a `query`.
        uri: `${radarServerURI}SearchBirdseyeInFlight?query={match ident ${
          req.params.airline
        }*} {true inAir}&howMany=500`,
        auth: {
          user: process.env.API_USER,
          pass: process.env.API_PASSWORD
        }
      },
      (apiErr, apiRes, apiBody) => {
        if (apiErr) {
          res
            .status(500)
            .send(
              'There was a problem getting data from the FlightAware server.'
            );
        } else {
          const { SearchBirdseyeInFlightResult } = JSON.parse(apiBody);
          res.send(
            createFleetFromAircraftList(SearchBirdseyeInFlightResult.aircraft)
          );
        }
      }
    );
  }
});

module.exports = router;
