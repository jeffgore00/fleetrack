'use strict';

// EXTERNAL DEPENDENCIES
const router = require('express').Router();
const request = require('request');

// INTERNAL DEPENDENCIES
const { Query } = require('../db/models');
const {
  handleFlightXMLResponse,
  configureFlightXMLRequest,
  queryExceedsLimit,
  overrideCodeValid
} = require('../utils');
const {
  MAX_AIRCRAFT_PER_FLEET_QUERY,
  API_SERVER_URI
} = require('../constants');

// ROUTES
router.get('/:airline', async (req, res, next) => {
  try {
    const queryCount = await Query.countBillingQueriesThisMonth();
    if (
      queryExceedsLimit(queryCount) &&
      !overrideCodeValid(req.query.override)
      // ADD 'overrideUsed' Boolean to db model!
    ) {
      res.status(300).send({
        message:
          'Query limit will be exceeded - special authorization required.'
      });
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
