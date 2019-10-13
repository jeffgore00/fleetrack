const Sequelize = require('sequelize');
const moment = require('moment');

const db = require('../db');

const BillingPeriod = db.define('billingPeriod', {
  startDate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date()
  },
  endDate: {
    type: Sequelize.DATE
  }
});

BillingPeriod.beforeValidate(bp => {
  bp.startDate = moment(bp.startDate)
    .startOf('day')
    .toDate();
});

BillingPeriod.getCurrentBp = async function() {
  const data = await db.query(`SELECT TOP 1 * from "billingPeriods" ORDER BY id DESC;`);
  return Number(data[0][0].max);
};

BillingPeriod.getCurrentBpId = async function() {
  const data = await db.query(`SELECT MAX(id) from "billingPeriods";`);
  return Number(data[0][0].max);
};

module.exports = BillingPeriod;
