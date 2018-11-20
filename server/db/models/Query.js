const Sequelize = require('sequelize');

const db = require('../db');
const { FA_AIRCRAFT_QUERY_LIMIT } = require('../../constants');

const Query = db.define('query', {
  carrier: {
    type: Sequelize.STRING,
    allowNull: false
  },
  resultCount: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  limit: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  queryCount: {
    type: Sequelize.VIRTUAL,
    get() {
      return Math.ceil(
        this.getDataValue('resultCount') / this.getDataValue('limit')
      );
    }
  }
});

// Does not work with 'beforeCreate', 'beforeValidate' is earlier in the
// lifecycle. We do this, rather than a default value, in order to not bake the
// query limit into the database table definition, b/c that limit could change.
Query.beforeValidate(query => {
  query.limit = FA_AIRCRAFT_QUERY_LIMIT;
});

Query.countBillingQueriesThisMonth = function() {
  // Casting one of the operands to decimal so that a decimal result is
  // possible, otherwise we are effectively doing FLOOR rather than ceiling,
  // taking only the integer portion of the division.
  return db
    .query(
      `SELECT
        SUM (
          CEILING(
            CAST("resultCount" AS decimal) / "limit"
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
    )
    .then(data => Number(data[0][0].sum));
};

module.exports = Query;
