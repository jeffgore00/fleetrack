const Sequelize = require('sequelize');
const moment = require('moment');

const db = require('../db');

const BillingPeriod = db.define('billingPeriod', {
  startDate: {
    type: Sequelize.DATE,
    allowNull: false
  },
  endDate: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

BillingPeriod.beforeValidate(bp => {
  bp.endDate = moment(bp.startDate)
    .add(29, 'days')
    .add(23, 'hours')
    .add(59, 'minutes')
    .add(59, 'seconds')
    .add(999, 'milliseconds')
    .toDate();
});

BillingPeriod.getCurrentBpId = async function() {
  const data = await db.query('SELECT MAX(id) FROM "billingPeriods"');
  return Number(data[0][0].max);
};

module.exports = BillingPeriod;
