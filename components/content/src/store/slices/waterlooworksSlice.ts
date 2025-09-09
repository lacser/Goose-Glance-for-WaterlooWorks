import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WaterlooWorksState {
  onJobId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WaterlooWorksState = {
  onJobId: null,
  isLoading: false,
  error: null
};

export const waterlooworksSlice = createSlice({
  name: 'waterlooworks',
  initialState,
  reducers: {
    setOnJobId: (state, action: PayloadAction<string | null>) => {
      state.onJobId = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const { setOnJobId, setIsLoading, setError } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
