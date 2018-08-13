'use strict';
const router = require('express').Router();
const request = require('request');
const { createFleetFromAircraftList } = require('../utils');
const radarServerURI =
  'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json';

router.get('/:airline', (req, res, next) => {
  request(
    `${radarServerURI}?fCallS=${req.params.airline}`,
    (apiErr, apiRes, apiBody) => {
      if (apiErr) {
        res
          .status(500)
          .send(
            'There was a problem getting data from the Virtual Radar Server.'
          );
      } else {
        const { acList } = JSON.parse(apiBody);
        res.send(createFleetFromAircraftList(acList));
      }
    }
  );
});

module.exports = router;
