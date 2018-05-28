import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const UPDATE_CURRENT_FLEET = 'UPDATE_CURRENT_FLEET';
const UPDATE_QUERY_INTERVAL = 'UPDATE_QUERY_INTERVAL';

const initialState = {
  currentFleet: 'DAL',
  queryInterval: null
};

export const acUpdateCurrentFleet = callsign => ({
  type: UPDATE_CURRENT_FLEET,
  callsign
});

export const acUpdateQueryInterval = interval => ({
  type: UPDATE_QUERY_INTERVAL,
  interval
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
      case UPDATE_CURRENT_FLEET:
        return Object.assign({}, state, { currentFleet: action.callsign });
      case UPDATE_QUERY_INTERVAL:
        return Object.assign({}, state, { queryInterval: action.interval });
      default:
        return state;
  }
};

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
