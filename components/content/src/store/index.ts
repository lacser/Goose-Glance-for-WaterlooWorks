import { configureStore } from '@reduxjs/toolkit';
import waterlooworksReducer from './slices/waterlooworksSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    waterlooworks: waterlooworksReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
