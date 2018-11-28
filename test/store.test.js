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
import {
  createFleetFromAircraftList,
  readFile,
  loadAirportFile
} from '../server/utils';
import { splitFleetOnOffChart } from '../client/data';
// Below trick: https://stackoverflow.com/a/33676328/6188150
import * as buildVisualization from '../client/viz/buildViz';

const path = require('path');
const middlewares = [thunkMiddleware];
const mockStore = configureMockStore(middlewares);
const initialState = {
  carrier: '', // will be three-char code like 'DAL'
  fleet: []
};
const store = mockStore(initialState);

async function getDummyFleet(code) {
  const fleetJSON = await readFile(
    path.join(__dirname, `./dummy/dummyFleet_${code}_FA_small.json`),
    'utf-8'
  );
  return fleetJSON;
}

let initialFleetJSON;
let initialFleet;
let buildVizStub;
let mock;

describe('action creators', () => {
  before(async () => {
    await loadAirportFile();
    initialFleetJSON = await getDummyFleet('DAL');
    initialFleet = createFleetFromAircraftList(JSON.parse(initialFleetJSON));
    // stub out buildVisualization when required by the store, because
    // we are not testing the visualization.
    buildVizStub = sinon.stub(buildVisualization, 'default');
  });

  after(() => {
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
  });

  it('fetchInitialFleet() returns a thunk to fetch the Delta fleet from the backend and dispatch a INITIAL_FLEET_LOADED action', async () => {
    mock.onGet('/api/DAL').replyOnce(200, initialFleet);
    await store.dispatch(fetchInitialFleet('DAL'));
    const actions = store.getActions();
    expect(actions[0].type).to.equal('INITIAL_FLEET_LOADED');
    expect(actions[0].fleet).to.deep.equal(
      splitFleetOnOffChart(initialFleet)[0]
    );
  });
});

describe('reducer', () => {
  it('INITIAL_FLEET_LOADED case should replace all three initial state properties', () => {
    const newState = reducer(initialState, {
      type: 'INITIAL_FLEET_LOADED',
      carrier: 'DAL',
      fleet: initialFleet
    });
    expect(newState.carrier).to.equal('DAL');
    expect(newState.fleet).to.deep.equal(initialFleet);
  });
});
