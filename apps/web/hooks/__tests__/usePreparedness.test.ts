import { renderHook, act } from '@testing-library/react';
import { usePreparedness, PREP_CATEGORIES, TOTAL_PREP_ITEMS } from '../usePreparedness';

beforeEach(() => localStorage.clear());

describe('usePreparedness', () => {
  it('starts at 0% with nothing checked', () => {
    const { result } = renderHook(() => usePreparedness());
    expect(result.current.completed).toBe(0);
    expect(result.current.overallPercent).toBe(0);
    expect(result.current.total).toBe(TOTAL_PREP_ITEMS);
  });

  it('toggling an item updates completion and persists to localStorage', () => {
    const cat = PREP_CATEGORIES[0];
    const item = cat.items[0];
    const { result } = renderHook(() => usePreparedness());

    act(() => result.current.toggle(cat.id, item.id));

    expect(result.current.isChecked(cat.id, item.id)).toBe(true);
    expect(result.current.completed).toBe(1);
    expect(localStorage.getItem('prepturk:preparedness')).toContain(`${cat.id}:${item.id}`);
  });

  it('computes per-category percentage', () => {
    const cat = PREP_CATEGORIES[0];
    const { result } = renderHook(() => usePreparedness());

    act(() => {
      cat.items.forEach((i) => result.current.toggle(cat.id, i.id));
    });

    expect(result.current.categoryPercent(cat.id)).toBe(100);
  });

  it('reset clears all progress', () => {
    const cat = PREP_CATEGORIES[0];
    const { result } = renderHook(() => usePreparedness());

    act(() => result.current.toggle(cat.id, cat.items[0].id));
    act(() => result.current.reset());

    expect(result.current.completed).toBe(0);
    expect(result.current.overallPercent).toBe(0);
  });
});
