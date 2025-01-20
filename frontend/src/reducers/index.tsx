import { routerReducer } from "react-router-redux";

import { MainActions } from "../actions/main-actions";
import initialState, { MainState } from "./initial-state";
import mainReducer from "./main-reducer";

export const Reducer = (state = initialState, action: MainActions): MainState => {
  let nextState = Object.assign({}, state);
  nextState = mainReducer(nextState, action);
  nextState.routing = routerReducer(nextState.routing, action);
  return nextState;
};

export default Reducer;
