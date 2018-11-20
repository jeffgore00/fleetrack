import { expect } from 'chai';

import db from '../server/db';
import { Query } from '../server/db/models';
import { FA_AIRCRAFT_QUERY_LIMIT } from '../server/constants';

describe('The Query Model', () => {
  before(() => db.sync({ force: true }));
  afterEach(() => db.sync({ force: true }));
  after(() => db.close());

  it('Has a field called `limit` corresponding to the maximum number of aircraft per billing query; this field auto-populates with a constant value', async () => {
    const query = await Query.create({
      carrier: 'DAL',
      resultCount: 413
    });
    expect(query.limit).to.equal(FA_AIRCRAFT_QUERY_LIMIT);
  });

  it('Has a virtual field called `queryCount` which is equal to an integer value corresponding to the number of result aircraft divided by the number of aircraft which constitute one billing query (i.e. `limit`)', async () => {
    const query = await Query.create({
      carrier: 'DAL',
      resultCount: 413
    });
    expect(query.queryCount).to.equal(28);
  });

  it('Has a class method called `countBillingQueriesThisMonth`, which returns that count', async () => {
    await Query.create({
      carrier: 'DAL',
      resultCount: 413, // 28 billing queries
      createdAt: new Date('2018-09-08') // override for diff month.
    });
    await Query.create({
      carrier: 'SWA',
      resultCount: 389 // 26 billing queries
    });
    await Query.create({
      carrier: 'SWA',
      resultCount: 272 // 19 billing queries
    });
    const queriesThisMonth = await Query.countBillingQueriesThisMonth();
    expect(queriesThisMonth).to.equal(45);
  });
});
