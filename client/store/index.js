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
  fleet: []
};

export const acInitialFleetLoaded = (carrier, fleet) => ({
  type: INITIAL_FLEET_LOADED,
  carrier,
  fleet
});

export const acNewCarrierSelected = carrier => ({
  type: NEW_CARRIER_SELECTED,
  carrier
});

export const acUpdateCurrentFleet = fleet => ({
  type: CURRENT_FLEET_UPDATED,
  fleet
});

export const fetchInitialFleet = carrier => async dispatch => {
  await getInitialFleet(carrier, dispatch);
};

export const fetchNewFleet = carrier => dispatch => {
  dispatch(acNewCarrierSelected(carrier));
  refreshFleetData(carrier, dispatch);
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case INITIAL_FLEET_LOADED:
      return {
        carrier: action.carrier,
        fleet: action.fleet,
        queryCount: action.queryCount
      };
    case NEW_CARRIER_SELECTED:
      return { ...state, carrier: action.carrier };
    case CURRENT_FLEET_UPDATED:
      return { ...state, fleet: action.fleet };
    default:
      return state;
  }
};

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
