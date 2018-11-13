'use strict';
const router = require('express').Router();
const request = require('request');
const { createFleetFromAircraftList } = require('../utils');
const radarServerURI = 'https://flightxml.flightaware.com/json/FlightXML2/';

if (process.env.NODE_ENV === 'development') require('../../secrets');

router.get('/:airline', (req, res, next) => {
  request(
    {
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
});

module.exports = router;
