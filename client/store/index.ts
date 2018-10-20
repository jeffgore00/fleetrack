import { createStore, applyMiddleware } from "redux";
import { createLogger } from "redux-logger";
import thunkMiddleware from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import { refreshFleetData, getInitialFleet } from "../data";
import { Airplane, ReduxAction, ReduxState } from "../utils";

const NEW_CARRIER_SELECTED = "NEW_CARRIER_SELECTED";
const CURRENT_FLEET_UPDATED = "CURRENT_FLEET_UPDATED";
const INITIAL_FLEET_LOADED = "INITIAL_FLEET_LOADED";

const initialState = {
  carrier: "", // will be three-char code like 'DAL'
  fleet: [] as Airplane[],
  queryIntervalId: 0
};

export const acInitialFleetLoaded = (
  carrier: string,
  fleet: Airplane[],
  queryIntervalId: number
): ReduxAction => ({
  type: INITIAL_FLEET_LOADED,
  carrier,
  fleet,
  queryIntervalId
});

export const acNewCarrierSelected = (
  carrier: string,
  queryIntervalId: number
): ReduxAction => ({
  type: NEW_CARRIER_SELECTED,
  carrier,
  queryIntervalId
});

export const acUpdateCurrentFleet = (fleet: Airplane[]): ReduxAction => ({
  type: CURRENT_FLEET_UPDATED,
  fleet
});

export const fetchInitialFleet = (carrier: string) => async (
  dispatch: Function
) => {
  await getInitialFleet(carrier, dispatch);
};

export const refreshFleet = (carrier: string) => async (dispatch: Function) => {
  await refreshFleetData(carrier, dispatch);
};

export const fetchNewFleet = (carrier: string) => async (
  dispatch: Function,
  getState: Function
) => {
  clearInterval(getState().queryIntervalId);
  let queryIntervalId = setInterval(
    () => dispatch(refreshFleet(carrier)),
    5000
  );
  dispatch(acNewCarrierSelected(carrier, queryIntervalId));
  refreshFleetData(carrier, dispatch);
};

export const reducer = (
  state: ReduxState = initialState,
  action: ReduxAction
): ReduxState => {
  switch (action.type) {
    case CURRENT_FLEET_UPDATED:
      return Object.assign({}, state, {
        fleet: action.fleet
      });
    case INITIAL_FLEET_LOADED:
      return {
        carrier: action.carrier,
        fleet: action.fleet,
        queryIntervalId: action.queryIntervalId
      };
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
