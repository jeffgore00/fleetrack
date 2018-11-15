'use strict';
const { app, createApp } = require('./server');
const { getAirports } = require('./server/utils');
const db = require('./server/db');
const PORT = process.env.PORT || 1337;

const startListening = () => {
  app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
};

const syncDb = () => db.sync();

// This evaluates as true when this file is run directly from the command line,
// i.e. when we say 'node server/index.js' (or 'nodemon server/index.js', or 'nodemon server', etc)
// It will evaluate false when this module is required by another module - for example,
// if we wanted to require our app in a test spec
if (require.main === module) {
  getAirports()
    .then(syncDb)
    .then(createApp)
    .then(startListening);
} else {
  createApp();
}
