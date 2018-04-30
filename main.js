'use strict';

const app = require('./server');
const { getAirports } = require('./server/utils');
const PORT = process.env.PORT || 1337;

getAirports()
  .then( () => {
    app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
  })
  .catch(err => console.log(err));

