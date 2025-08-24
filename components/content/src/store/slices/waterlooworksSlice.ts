import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WaterlooWorksState {
  onJobId: string | null;
}

const initialState: WaterlooWorksState = {
  onJobId: null
};

export const waterlooworksSlice = createSlice({
  name: 'waterlooworks',
  initialState,
  reducers: {
    setOnJobId: (state, action: PayloadAction<string | null>) => {
      state.onJobId = action.payload;
    }
  }
});

export const { setOnJobId } = waterlooworksSlice.actions;

export default waterlooworksSlice.reducer;
