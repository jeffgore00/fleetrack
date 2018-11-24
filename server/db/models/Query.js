const Sequelize = require('sequelize');

const db = require('../db');
const BillingPeriod = require('./BillingPeriod');
const {
  FA_BILLING_QUERY_SIZE,
  JG_RESULT_SIZE_LIMIT
} = require('../../constants');

const Query = db.define('query', {
  accepted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  succeeded: {
    type: Sequelize.BOOLEAN
  },
  carrier: {
    type: Sequelize.STRING
  },
  billingQuerySize: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  resultCount: {
    type: Sequelize.INTEGER
  },
  resultUpperBound: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  overrideUsed: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  metadata: {
    type: Sequelize.TEXT
  },
  billingQueryCount: {
    type: Sequelize.VIRTUAL,
    get() {
      return Math.ceil(
        this.getDataValue('resultCount') / this.getDataValue('billingQuerySize')
      );
    }
  }
});

// Does not work with 'beforeCreate', 'beforeValidate' is earlier in the
// lifecycle. We do this, rather than a default value, in order to not bake the
// query limit into the database table definition, b/c that limit could change.
Query.beforeValidate(query => {
  query.billingQuerySize = FA_BILLING_QUERY_SIZE;
  query.resultUpperBound = JG_RESULT_SIZE_LIMIT;
});

Query.afterCreate(async query => {
  const bpId = await BillingPeriod.getCurrentBpId();
  await query.setBillingPeriod(bpId);
});

Query.countBillingQueriesThisPeriod = async function() {
  // Casting one of the operands to decimal so that a decimal result is
  // possible, otherwise we are effectively doing FLOOR rather than ceiling,
  // taking only the integer portion of the division because the SQL column
  // datatype of both columns is INT, hence we'd get an INT result.
  const data = await db.query(
    `SELECT
        SUM (
          CEILING(
            CAST("resultCount" AS decimal) / "billingQuerySize"
          )
        )
      FROM
        (SELECT *
        FROM
          queries
        WHERE
          "billingPeriodId" = (
            SELECT
              MAX(id)
            FROM
              "billingPeriods"
            WHERE
              "startDate" <= NOW() AND
              "endDate" >= NOW()
            )
        ) AS "subquery"
    ;`
  );
  return Number(data[0][0].sum);
};

Query.countBillingQueriesThisMonth = async function() {
  const data = await db.query(
    `SELECT
        SUM (
          CEILING(
            CAST("resultCount" AS decimal) / "billingQuerySize"
          )
        )
      FROM
        (SELECT *
        FROM
          queries
        WHERE
          EXTRACT(
            MONTH FROM DATE_TRUNC('MONTH', queries."createdAt")
          ) = EXTRACT(
            MONTH FROM NOW()
          )
        ) AS "subquery"
    ;`
  );
  return Number(data[0][0].sum);
};

module.exports = Query;
