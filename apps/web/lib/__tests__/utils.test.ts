import { cn, debounce, generateId } from '../utils';

describe('cn', () => {
  it('merges class names and drops falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('lets later Tailwind utilities win conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('invokes the function once after the delay, with the latest args', () => {
    const spy = jest.fn();
    const debounced = debounce(spy, 200);
    debounced('a');
    debounced('b');
    expect(spy).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('b');
  });
});

describe('generateId', () => {
  it('produces a non-empty alphanumeric id', () => {
    const id = generateId();
    expect(id).toMatch(/^[a-z0-9]+$/);
    expect(id.length).toBeGreaterThan(0);
  });

  it('produces distinct ids across calls', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBeGreaterThan(1);
  });
});
