import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import { expect } from 'chai';
import sinon from 'sinon';
import {
  reducer,
  acInitialFleetLoaded,
  fetchInitialFleet
} from '../client/store';
import { readFile } from '../server/utils';
// Below trick: https://stackoverflow.com/a/33676328/6188150
import * as buildVisualization from '../client/viz/buildViz';

const path = require('path');
const middlewares = [thunkMiddleware];
const mockStore = configureMockStore(middlewares);
const initialState = {
  carrier: '', // will be three-char code like 'DAL'
  fleet: [],
  queryIntervalId: 0
};
const store = mockStore(initialState);

async function getDummyFleet(code) {
  const fleetJSON = await readFile(
    path.join(__dirname, `./dummy/dummyFleet_${code}.json`),
    'utf-8'
  );
  return fleetJSON;
}

let initialFleetJSON;
let initialFleet;
let clock;
let buildVizStub;
let mock;

describe('action creators', () => {
  before(async () => {
    initialFleetJSON = await getDummyFleet('DAL');
    initialFleet = JSON.parse(initialFleetJSON);
    // stub setInterval and clearInterval b/c they are used in the thunk
    clock = sinon.useFakeTimers();
    // also stub out buildVisualization when required by the store, because
    // we are not testing the visualization.
    buildVizStub = sinon.stub(buildVisualization, 'default');
  });

  after(() => {
    clock.restore();
    buildVizStub.restore();
    mock.restore();
  });

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('acInitialFleetLoaded() should contain all three state properties', () => {
    const initialFleetLoadedAction = acInitialFleetLoaded(
      'DAL',
      initialFleet,
      3
    );
    expect(initialFleetLoadedAction.type).to.equal('INITIAL_FLEET_LOADED');
    expect(initialFleetLoadedAction.carrier).to.equal('DAL');
    expect(initialFleetLoadedAction.fleet).to.deep.equal(initialFleet);
    expect(initialFleetLoadedAction.queryIntervalId).to.equal(3);
  });

  it('fetchInitialFleet() returns a thunk to fetch the Delta fleet from the backend and dispatch a INITIAL_FLEET_LOADED action', async () => {
    mock.onGet('/api/DAL').replyOnce(200, initialFleet);
    await store.dispatch(fetchInitialFleet('DAL'));
    const actions = store.getActions();
    expect(actions[0].type).to.equal('INITIAL_FLEET_LOADED');
    expect(actions[0].fleet).to.deep.equal(initialFleet);
  });
});

describe('reducer', () => {
  it('INITIAL_FLEET_LOADED case should replace all three initial state properties', () => {
    const newState = reducer(initialState, {
      type: 'INITIAL_FLEET_LOADED',
      carrier: 'DAL',
      fleet: initialFleet,
      queryIntervalId: 3
    });
    expect(newState.carrier).to.equal('DAL');
    expect(newState.fleet).to.deep.equal(initialFleet);
    expect(newState.queryIntervalId).to.equal(3);
  });
});
