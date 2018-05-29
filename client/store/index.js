import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { getFleet, updateVisualization } from '../index';

const CURRENT_FLEET_UPDATED = 'CURRENT_FLEET_UPDATED';

const initialState = {
  currentFleet: 'DAL',
  queryInterval: setInterval(() => updateVisualization('DAL'), 5000)
};

export const acUpdateCurrentFleet = carrierCode => ({
  type: CURRENT_FLEET_UPDATED,
  carrierCode
});

export const fetchNewFleet = carrierCode => (dispatch, getState) =>
  getFleet(carrierCode)
    .then(() => {
      clearInterval(getState().queryInterval);
      dispatch(acUpdateCurrentFleet(carrierCode));
    })
    .catch(err => console.log(err));

const reducer = (state = initialState, action) => {
  switch (action.type) {
      case CURRENT_FLEET_UPDATED:
        return {
          currentFleet: action.carrierCode,
          queryInterval: setInterval(
            () => updateVisualization(action.carrierCode),
            5000
          )
        };
      default:
        return state;
  }
};

const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
