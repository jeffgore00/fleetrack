'use strict';
const router = require('express').Router();
const request = require('request');
const { createFleetFromAircraftList } = require('../utils');
const radarServerURI = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json';

let fleet;

router.get('/:airline', (req, res, next) => {
  request(
    `${radarServerURI}?fCallS=${req.params.airline}`, 
    (apiErr, apiRes, apiBody) => {
      const data = JSON.parse(apiBody);
      fleet = createFleetFromAircraftList(data.acList);
      res.send(fleet);
    });
});

module.exports = router;
