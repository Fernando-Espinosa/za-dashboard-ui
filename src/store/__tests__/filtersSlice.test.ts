import { describe, it, expect } from 'vitest';
import filtersReducer, {
  setCardFilter,
  setBPFilter,
  setO2Filter,
  setHRFilter,
  setAgeFilter,
  resetAllFilters,
  FilterState,
} from '../filtersSlice';

describe('filters slice', () => {
  const initialState: FilterState = {
    cardFilter: null,
    bpFilter: 'all',
    o2Filter: 'all',
    hrFilter: 'all',
    ageFilter: 'all',
  };

  it('should handle initial state', () => {
    expect(filtersReducer(undefined, { type: 'unknown' })).toEqual(
      initialState
    );
  });

  describe('setCardFilter', () => {
    it('should set the cardFilter value', () => {
      const actual = filtersReducer(initialState, setCardFilter('highBP'));
      expect(actual.cardFilter).toEqual('highBP');
    });

    it('should reset dropdown filters when setting a card filter', () => {
      const modifiedState: FilterState = {
        ...initialState,
        bpFilter: 'high',
        o2Filter: 'low',
      };
      const actual = filtersReducer(modifiedState, setCardFilter('highBP'));
      expect(actual).toEqual({
        cardFilter: 'highBP',
        bpFilter: 'all',
        o2Filter: 'all',
        hrFilter: 'all',
        ageFilter: 'all',
      });
    });

    it('should allow setting cardFilter to null', () => {
      const stateWithFilter: FilterState = {
        ...initialState,
        cardFilter: 'highBP',
      };
      const actual = filtersReducer(stateWithFilter, setCardFilter(null));
      expect(actual.cardFilter).toBeNull();
    });
  });

  describe('setBPFilter', () => {
    it('should set the bpFilter value', () => {
      const actual = filtersReducer(initialState, setBPFilter('high'));
      expect(actual.bpFilter).toEqual('high');
    });

    it('should reset cardFilter when setting a non-all BP filter', () => {
      const stateWithCardFilter: FilterState = {
        ...initialState,
        cardFilter: 'highBP',
      };
      const actual = filtersReducer(stateWithCardFilter, setBPFilter('high'));
      expect(actual).toEqual({
        cardFilter: null,
        bpFilter: 'high',
        o2Filter: 'all',
        hrFilter: 'all',
        ageFilter: 'all',
      });
    });

    it('should not reset cardFilter when setting to "all"', () => {
      const stateWithCardFilter: FilterState = {
        ...initialState,
        cardFilter: 'highBP',
        bpFilter: 'high',
      };
      const actual = filtersReducer(stateWithCardFilter, setBPFilter('all'));
      expect(actual.cardFilter).toEqual('highBP');
      expect(actual.bpFilter).toEqual('all');
    });
  });

  describe('setO2Filter', () => {
    it('should set the o2Filter value', () => {
      const actual = filtersReducer(initialState, setO2Filter('low'));
      expect(actual.o2Filter).toEqual('low');
    });

    it('should reset cardFilter when setting a non-all O2 filter', () => {
      const stateWithCardFilter: FilterState = {
        ...initialState,
        cardFilter: 'lowO2',
      };
      const actual = filtersReducer(stateWithCardFilter, setO2Filter('low'));
      expect(actual).toEqual({
        cardFilter: null,
        bpFilter: 'all',
        o2Filter: 'low',
        hrFilter: 'all',
        ageFilter: 'all',
      });
    });
  });

  describe('setHRFilter', () => {
    it('should set the hrFilter value', () => {
      const actual = filtersReducer(initialState, setHRFilter('low'));
      expect(actual.hrFilter).toEqual('low');
    });

    it('should reset cardFilter when setting a non-all HR filter', () => {
      const stateWithCardFilter: FilterState = {
        ...initialState,
        cardFilter: 'lowO2',
      };
      const actual = filtersReducer(stateWithCardFilter, setHRFilter('high'));
      expect(actual.cardFilter).toBeNull();
      expect(actual.hrFilter).toEqual('high');
    });
  });

  describe('setAgeFilter', () => {
    it('should set the ageFilter value', () => {
      const actual = filtersReducer(initialState, setAgeFilter('under18'));
      expect(actual.ageFilter).toEqual('under18');
    });

    it('should reset cardFilter when setting a non-all age filter', () => {
      const stateWithCardFilter: FilterState = {
        ...initialState,
        cardFilter: 'highBP',
      };
      const actual = filtersReducer(
        stateWithCardFilter,
        setAgeFilter('30to50')
      );
      expect(actual.cardFilter).toBeNull();
      expect(actual.ageFilter).toEqual('30to50');
    });
  });

  describe('resetAllFilters', () => {
    it('should reset all filters to initial state', () => {
      const modifiedState: FilterState = {
        cardFilter: 'highBP',
        bpFilter: 'high',
        o2Filter: 'low',
        hrFilter: 'high',
        ageFilter: '18to30',
      };
      const actual = filtersReducer(modifiedState, resetAllFilters());
      expect(actual).toEqual(initialState);
    });
  });
});
