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
const { JG_RESULT_SIZE_LIMIT, API_SERVER_URI } = require('../constants');

// ROUTES
router.get('/:airline', async (req, res, next) => {
  try {
    const queryCount = await Query.countBillingQueriesThisMonth();
    if (
      queryExceedsLimit(queryCount) &&
      !overrideCodeValid(req.body.override)
    ) {
      res.send({
        message:
          'Query limit will be exceeded - special authorization required.'
      });
      Query.create({
        carrier: req.params.airline,
        accepted: false
      });
    } else {
      request(
        configureFlightXMLRequest(
          API_SERVER_URI,
          req.params.airline,
          process.env.API_USER,
          process.env.API_PASSWORD,
          JG_RESULT_SIZE_LIMIT
        ),
        (...args) => handleFlightXMLResponse(...args, req, res, next)
      );
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
