'use strict';
const { app, createApp } = require('./server');
const { loadAirportFile } = require('./server/utils');
const db = require('./server/db');
const PORT = process.env.PORT || 1337;

const startListening = () => {
  app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
};

const syncDb = () => db.sync({ force: true });

loadAirportFile()
  .then(syncDb)
  .then(createApp)
  .then(startListening);
