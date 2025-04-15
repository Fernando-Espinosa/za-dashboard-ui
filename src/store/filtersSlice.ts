import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define filter types
type BPCategory = 'all' | 'low' | 'normal' | 'high';
type O2Category = 'all' | 'low' | 'normal' | 'high';
type HRCategory = 'all' | 'low' | 'normal' | 'high';
type AgeRangeCategory = 'all' | 'under18' | '18to30' | '30to50' | 'over50';
export type CardFilterKey =
  | 'highBP'
  | 'lowO2'
  | 'normalO2'
  | 'highO2'
  | 'lowHR'
  | 'normalHR'
  | 'highHR'
  | null;

// Define the state structure
export interface FilterState {
  cardFilter: CardFilterKey;
  bpFilter: BPCategory;
  o2Filter: O2Category;
  hrFilter: HRCategory;
  ageFilter: AgeRangeCategory;
}

// Define RootState interface for selectors
interface RootState {
  filters: FilterState;
}

// Define initial state
const initialState: FilterState = {
  cardFilter: null,
  bpFilter: 'all',
  o2Filter: 'all',
  hrFilter: 'all',
  ageFilter: 'all',
};

// Create the slice
export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setCardFilter: (state, action: PayloadAction<CardFilterKey>) => {
      state.cardFilter = action.payload;
      // Reset dropdown filters when card filter is selected
      if (action.payload !== null) {
        state.bpFilter = 'all';
        state.o2Filter = 'all';
        state.hrFilter = 'all';
        state.ageFilter = 'all';
      }
    },
    setBPFilter: (state, action: PayloadAction<BPCategory>) => {
      state.bpFilter = action.payload;
      // Reset card filter when dropdown filter is selected
      if (action.payload !== 'all') {
        state.cardFilter = null;
      }
    },
    setO2Filter: (state, action: PayloadAction<O2Category>) => {
      state.o2Filter = action.payload;
      // Reset card filter when dropdown filter is selected
      if (action.payload !== 'all') {
        state.cardFilter = null;
      }
    },
    setHRFilter: (state, action: PayloadAction<HRCategory>) => {
      state.hrFilter = action.payload;
      // Reset card filter when dropdown filter is selected
      if (action.payload !== 'all') {
        state.cardFilter = null;
      }
    },
    setAgeFilter: (state, action: PayloadAction<AgeRangeCategory>) => {
      state.ageFilter = action.payload;
      // Reset card filter when dropdown filter is selected
      if (action.payload !== 'all') {
        state.cardFilter = null;
      }
    },
    resetAllFilters: (state) => {
      state.cardFilter = null;
      state.bpFilter = 'all';
      state.o2Filter = 'all';
      state.hrFilter = 'all';
      state.ageFilter = 'all';
    },
  },
});

// Export actions
export const {
  setCardFilter,
  setBPFilter,
  setO2Filter,
  setHRFilter,
  setAgeFilter,
  resetAllFilters,
} = filtersSlice.actions;

// Export selectors
export const selectCardFilter = (state: RootState) => state.filters.cardFilter;
export const selectBPFilter = (state: RootState) => state.filters.bpFilter;
export const selectO2Filter = (state: RootState) => state.filters.o2Filter;
export const selectHRFilter = (state: RootState) => state.filters.hrFilter;
export const selectAgeFilter = (state: RootState) => state.filters.ageFilter;

// Export reducer
export default filtersSlice.reducer;
