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

  it('Has a virtual field called `billingQueryCount` which is equal to an integer value corresponding to the number of result aircraft divided by its billing query `limit`, rounded up)', async () => {
    const query = await Query.create({
      carrier: 'DAL',
      resultCount: 413
    });
    // If FA_AIRCRAFT_QUERY_LIMIT is 15, then `billingQueryCount` would be 28.
    // 413 / 15 = 27.53 => rounded up is 28.
    expect(query.billingQueryCount).to.equal(
      Math.ceil(query.resultCount / query.limit)
    );
  });

  it('Has a class method called `countBillingQueriesThisMonth`, which returns that count', async () => {
    await Query.create({
      carrier: 'DAL',
      resultCount: 413,
      createdAt: new Date('2018-09-08') // override to ensure different month.
    });
    const query2 = await Query.create({
      carrier: 'SWA',
      resultCount: 389
    });
    const query3 = await Query.create({
      carrier: 'SWA',
      resultCount: 272
    });
    const queriesThisMonth = await Query.countBillingQueriesThisMonth();
    expect(queriesThisMonth).to.equal(
      Math.ceil(query2.resultCount / query2.limit) +
        Math.ceil(query3.resultCount / query3.limit)
    );
  });
});
