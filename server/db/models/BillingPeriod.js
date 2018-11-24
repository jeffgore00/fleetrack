const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

const db = require('../db');

const BillingPeriod = db.define('billingPeriod', {
  startDate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: new Date()
  },
  endDate: {
    type: Sequelize.DATE,
    allowNull: false
  }
});

BillingPeriod.beforeValidate(bp => {
  bp.startDate = moment(bp.startDate)
    .startOf('day')
    .toDate();
  bp.endDate = moment(bp.startDate)
    .startOf('day')
    .add(29, 'days')
    .add(23, 'hours')
    .add(59, 'minutes')
    .add(59, 'seconds')
    .add(999, 'milliseconds')
    .toDate();
});

BillingPeriod.getCurrentBpId = async function() {
  const now = new Date();
  const billingPeriod = await BillingPeriod.findOne({
    where: {
      startDate: {
        [Op.lte]: now
      },
      endDate: {
        [Op.gte]: now
      }
    }
  });
  return billingPeriod ? billingPeriod.id : null;
};

module.exports = BillingPeriod;
