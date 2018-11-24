const Query = require('./Query');
const BillingPeriod = require('./BillingPeriod');

Query.belongsTo(BillingPeriod);

module.exports = {
  Query,
  BillingPeriod
};
