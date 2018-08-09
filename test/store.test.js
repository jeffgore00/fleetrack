import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import configureMockStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';
import {
  reducer,
  acInitialFleetLoaded,
  acNewCarrierSelected,
  acUpdateCurrentFleet,
  fetchInitialFleet,
  fetchNewFleet,
  refreshfleet
} from '../client/store';

const middlewares = [thunkMiddleware];
const mockStore = configureMockStore(middlewares);
const initialState = {
  carrier: '', // will be three-char code like 'DAL'
  fleet: [],
  queryIntervalId: 0
};
const store = mockStore(initialState);

describe('action creators', () => {
  // const fleet = [ dummy fleet ]

  let mock;
  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should allow synchronous creation of SELECT_CAMPUS actions', () => {
    const selectCampusAction = selectCampus(marsCampus);
    expect(selectCampusAction.type).to.equal(SELECT_CAMPUS);
    expect(selectCampusAction.campus).to.equal(marsCampus);
  });

  it('fetchCampuses() returns a thunk to fetch campuses from the backend and dispatch a SET_CAMPUSES action', async () => {
    mock.onGet('/api/campuses').replyOnce(200, campuses);
    await store.dispatch(fetchCampuses());
    const actions = store.getActions();
    expect(actions[0].type).to.equal('SET_CAMPUSES');
    expect(actions[0].campuses).to.deep.equal(campuses);
  });
});

describe('reducer', () => {
  // defined in ../client/redux/reducer.js

  it('returns a new state with selected campus', () => {
    const newState = reducer(initialState, {
      type: SELECT_CAMPUS,
      campus: marsCampus
    });
    expect(newState.selectedCampus).to.equal(marsCampus);
    expect(initialState.selectedCampus).to.deep.equal({});
  });
});
