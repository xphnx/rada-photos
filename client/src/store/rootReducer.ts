import { combineReducers } from "@reduxjs/toolkit";

import { api } from "../api/baseApi";
import { store } from "./store";

const rootReducer = combineReducers({
    [api.reducerPath]: api.reducer
})


export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>
export default rootReducer;
