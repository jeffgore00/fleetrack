'use strict';

// EXTERNAL DEPENDENCIES
const router = require('express').Router();
const request = require('request');

// INTERNAL DEPENDENCIES
const { Query } = require('../db/models');
const {
  handleFlightXMLResponse,
  configureFlightXMLRequest,
  queryExceedsLimit
} = require('../utils');
const {
  MAX_AIRCRAFT_PER_FLEET_QUERY,
  API_SERVER_URI
} = require('../constants');

// ROUTES
router.get('/:airline', async (req, res, next) => {
  try {
    const queryCount = await Query.countBillingQueriesThisMonth();
    if (queryExceedsLimit(queryCount)) {
      console.log('sorry');
    } else {
      request(
        configureFlightXMLRequest(
          API_SERVER_URI,
          req.params.airline,
          process.env.API_USER,
          process.env.API_PASSWORD,
          MAX_AIRCRAFT_PER_FLEET_QUERY
        ),
        (...args) => handleFlightXMLResponse(...args, req, res, next)
      );
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
