import { describe, it, expect } from 'vitest';
import {
  highlightStyle,
  realTimeColumnStyle,
  tableStyle,
} from '../PatientDashboard.styles';

describe('PatientDashboard.styles', () => {
  it('highlightStyle has correct properties', () => {
    expect(highlightStyle).toHaveProperty('transition');
    expect(highlightStyle).toHaveProperty('backgroundColor');
    expect(highlightStyle.backgroundColor).toBe('#fff9c4'); // light yellow
    expect(highlightStyle.transition).toBe('background-color 0.3s ease');
  });

  it('realTimeColumnStyle has correct background color', () => {
    expect(realTimeColumnStyle).toHaveProperty('backgroundColor');
    expect(realTimeColumnStyle.backgroundColor).toBe('#f1f8ff'); // very light blue
  });

  it('tableStyle has correct minimum width', () => {
    expect(tableStyle).toHaveProperty('minWidth');
    expect(tableStyle.minWidth).toBe(650);
  });
});
