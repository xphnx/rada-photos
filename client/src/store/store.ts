import { configureStore } from '@reduxjs/toolkit';

import { authApi } from '../api/authApi/authApi';
import { errorToastMiddleware } from './errorMiddleware';
import rootReducer from './rootReducer';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, errorToastMiddleware),
});


