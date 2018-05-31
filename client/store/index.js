import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { refreshFleetData, getInitialFleet } from '../data';

const NEW_CARRIER_SELECTED = 'NEW_CARRIER_SELECTED';
const CURRENT_FLEET_UPDATED = 'CURRENT_FLEET_UPDATED';
const INITIAL_FLEET_LOADED = 'INITIAL_FLEET_LOADED';

const initialState = {
  carrier: '', // will be three-char code like 'DAL'
  fleet: {},
  queryIntervalId: 0
};

export const acInitialFleetLoaded = (carrier, queryIntervalId) => ({
  type: INITIAL_FLEET_LOADED,
  carrier,
  queryIntervalId
});

export const acNewCarrierSelected = (carrier, queryIntervalId) => ({
  type: NEW_CARRIER_SELECTED,
  carrier,
  queryIntervalId
});

export const acUpdateCurrentFleet = fleet => ({
  type: CURRENT_FLEET_UPDATED,
  fleet
});

export const fetchInitialFleet = carrier => dispatch => {
  getInitialFleet(carrier, dispatch);
};

export const fetchNewFleet = carrier => (dispatch, getState) => {
  clearInterval(getState().queryIntervalId);
  let queryIntervalId = setInterval(
    () => dispatch(refreshFleet(carrier)),
    5000
  );
  dispatch(acNewCarrierSelected(carrier, queryIntervalId));
  refreshFleetData(carrier, dispatch);
};

export const refreshFleet = carrier => dispatch => {
  refreshFleetData(carrier, dispatch);
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
      case CURRENT_FLEET_UPDATED:
        return Object.assign({}, state, {
          fleet: action.fleet
        });
      case INITIAL_FLEET_LOADED:
      case NEW_CARRIER_SELECTED:
        return Object.assign({}, state, {
          carrier: action.carrier,
          queryIntervalId: action.queryIntervalId
        });
      default:
        return state;
  }
};

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
