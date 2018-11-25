import { expect } from 'chai';
import moment from 'moment';

import db from '../server/db';
import { Query, BillingPeriod } from '../server/db/models';
import { FA_BILLING_QUERY_SIZE } from '../server/constants';

describe('The Query Model', () => {
  before(async () => {
    await db.sync({ force: true });
  });
  beforeEach(async () => {
    await BillingPeriod.create({
      // including time because if not included, then time zone is assumed to
      // be UTC; time inclusion means date string is parsed as local.
      startDate: new Date('2018-05-10T00:00:00')
    });
  });
  afterEach(async () => {
    await db.sync({ force: true });
  });

  it('Has a field called `billingQuerySize` corresponding to the maximum number of aircraft per billing query; this field auto-populates with a constant value', async () => {
    const query = await Query.create({
      carrier: 'DAL',
      resultCount: 413
    });
    expect(query.billingQuerySize).to.equal(FA_BILLING_QUERY_SIZE);
  });

  it('will have a `billingPeriodId` corresponding to the billing period within which it falls', async () => {
    const query = await Query.create({
      carrier: 'DAL',
      resultCount: 413,
      createdAt: new Date('2018-05-24T15:32:54'),
      billingPeriodId: 1
    });
    await BillingPeriod.create(); // billing period with id #2
    const query2 = await Query.create({
      carrier: 'UAL',
      resultCount: 332
      // billingPeriodId: by default, is assigned to current billing period -
      // which we just created above.
    });
    expect(query.billingPeriodId).to.equal(1);
    expect(query2.billingPeriodId).to.equal(2);
  });

  it('Has a virtual field called `billingQueryCount` which is equal to an integer value corresponding to the number of result aircraft divided by its `billingQuerySize`, rounded up)', async () => {
    const query = await Query.create({
      carrier: 'DAL',
      resultCount: 413
    });
    // If FA_BILLING_QUERY_SIZE is 15, then `billingQueryCount` would be 28.
    // 413 / 15 = 27.53 => rounded up is 28.
    expect(query.billingQueryCount).to.equal(
      Math.ceil(query.resultCount / query.billingQuerySize)
    );
  });

  it('Has a class method called `countBillingQueriesThisPeriod`, which a count of all billing queries associated with the latest billing period (max billing period ID)', async () => {
    // creating a potential foil; this should NOT factor into final results.
    await Query.create({
      carrier: 'UAL',
      resultCount: 429,
      createdAt: new Date('2018-06-05')
    });
    await BillingPeriod.create();
    const query2 = await Query.create({
      carrier: 'DAL',
      resultCount: 278
    });
    const query3 = await Query.create({
      carrier: 'SWA',
      resultCount: 122
    });
    const queriesThisPeriod = await Query.countBillingQueriesThisPeriod();
    expect(queriesThisPeriod).to.equal(
      Math.ceil(query2.resultCount / query2.billingQuerySize) +
        Math.ceil(query3.resultCount / query3.billingQuerySize)
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
      Math.ceil(query2.resultCount / query2.billingQuerySize) +
        Math.ceil(query3.resultCount / query3.billingQuerySize)
    );
  });
});

describe('The BillingPeriod model', () => {
  before(async () => {
    await db.sync({ force: true });
  });
  afterEach(async () => {
    await db.sync({ force: true });
  });
  after(async () => {
    await db.close();
  });
  it('has a startDate which defaults to the current date, at midnight, if no date is supplied', async () => {
    const billingPeriod = await BillingPeriod.create();
    const now = new Date();
    const nowDate = moment(now)
      .startOf('day')
      .toDate();
    expect(billingPeriod.startDate).to.deep.equal(nowDate);
    expect(billingPeriod.startDate.getHours()).to.equal(0);
    expect(billingPeriod.startDate.getMinutes()).to.equal(0);
    expect(billingPeriod.startDate.getSeconds()).to.equal(0);
  });

  it('has an endDate which is auto-populated to 11:59:59.999 PM on the 29th day after the startDate, to represent a 30 day billing period - this will overwrite any manually set date', async () => {
    const billingPeriod = await BillingPeriod.create({
      startDate: new Date('2018-07-07'),
      endDate: new Date('2022-08-08')
    });
    const actualEndDate = billingPeriod.endDate;
    const expectedEndDate = moment(billingPeriod.startDate)
      .add(29, 'days')
      .add(23, 'hours')
      .add(59, 'minutes')
      .add(59, 'seconds')
      .add(999, 'milliseconds')
      .toDate();
    expect(actualEndDate).to.deep.equal(expectedEndDate);
  });

  it('has a method `getCurrentBpId`, meaning get current billing period id, which returns the id of the billing period corresponding to the current date', async () => {
    await BillingPeriod.create({
      startDate: new Date('2018-05-01')
    });
    await BillingPeriod.create({
      startDate: new Date('2018-06-01')
    });
    await BillingPeriod.create();
    await BillingPeriod.create({
      startDate: new Date('2054-01-21')
    });
    expect(await BillingPeriod.getCurrentBpId()).to.equal(3);
  });
});
