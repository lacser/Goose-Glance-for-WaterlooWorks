import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WaterlooWorksState {
  onJobId: string | null;
  isLoading: boolean;
}

const initialState: WaterlooWorksState = {
  onJobId: null,
  isLoading: false
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
    }
  }
});

export const { setOnJobId, setIsLoading } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
