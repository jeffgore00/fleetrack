import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

import { refreshFleetData, getInitialFleet } from '../data';

const NEW_CARRIER_SELECTED = 'NEW_CARRIER_SELECTED';
const CURRENT_FLEET_UPDATED = 'CURRENT_FLEET_UPDATED';
const INITIAL_FLEET_LOADED = 'INITIAL_FLEET_LOADED';

export const STS_LOADING = 'STS_LOADING';
export const STS_FLEET_LOADED = 'STS_FLEET_LOADED';
export const STS_INITAL_REQ_REJECTED = 'STS_INITAL_REQ_REJECTED';
export const STS_OVERRIDE_FAILED = 'STS_OVERRIDE_FAILED';
export const STS_REJECTION_ACKNOWLEDGED = 'STS_REJECTION_ACKNOWLEDGED';

const initialState = {
  carrier: '', // will be three-char code like 'DAL'
  fleet: [],
  status: STS_LOADING
};

export const acInitialFleetLoaded = (carrier, fleet) => ({
  type: INITIAL_FLEET_LOADED,
  carrier,
  fleet,
  status: STS_FLEET_LOADED
});

export const acNewCarrierSelected = carrier => ({
  type: NEW_CARRIER_SELECTED,
  carrier
});

export const acUpdateCurrentFleet = fleet => ({
  type: CURRENT_FLEET_UPDATED,
  fleet
});

export const acUserRequestRejected = () => ({
  type: STS_INITAL_REQ_REJECTED,
  status: STS_INITAL_REQ_REJECTED
});

export const acUserOverrideFailed = () => ({
  type: STS_OVERRIDE_FAILED,
  status: STS_OVERRIDE_FAILED
});

export const acUserAcknowledgesRejection = () => ({
  type: STS_REJECTION_ACKNOWLEDGED,
  status: STS_REJECTION_ACKNOWLEDGED
});

export const fetchInitialFleet = (carrier, password) => async dispatch => {
  await getInitialFleet(carrier, dispatch, password);
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
        queryCount: action.queryCount,
        status: STS_FLEET_LOADED
      };
    case NEW_CARRIER_SELECTED:
      return { ...state, carrier: action.carrier };
    case CURRENT_FLEET_UPDATED:
      return { ...state, fleet: action.fleet };
    case STS_INITAL_REQ_REJECTED:
    case STS_OVERRIDE_FAILED:
    case STS_REJECTION_ACKNOWLEDGED:
      return { ...state, status: action.status };
    default:
      return state;
  }
};

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
