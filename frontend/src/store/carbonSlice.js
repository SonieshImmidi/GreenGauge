import { createSlice } from '@reduxjs/toolkit';

const carbonSlice = createSlice({
  name: 'carbon',
  initialState: {
    report: null,
    history: [],
    lastCalculation: null,
    recommendations: [],
    loading: false,
    error: null,
  },
  reducers: {
    setReport: (state, action) => { state.report = action.payload; },
    setHistory: (state, action) => { state.history = action.payload; },
    setLastCalculation: (state, action) => { state.lastCalculation = action.payload; },
    setRecommendations: (state, action) => { state.recommendations = action.payload; },
    setCarbonLoading: (state, action) => { state.loading = action.payload; },
    setCarbonError: (state, action) => { state.error = action.payload; },
  },
});

export const {
  setReport, setHistory, setLastCalculation, setRecommendations,
  setCarbonLoading, setCarbonError,
} = carbonSlice.actions;
export default carbonSlice.reducer;
