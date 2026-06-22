import { renderHook, act } from '@testing-library/react';
import { useNotes, sortNotes, type Note } from '../useNotes';

beforeEach(() => localStorage.clear());

describe('sortNotes', () => {
  it('puts pinned notes first, then most-recent', () => {
    const notes: Note[] = [
      { id: 'a', title: 'A', body: '', pinned: false, updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: 'b', title: 'B', body: '', pinned: true, updatedAt: '2025-01-01T00:00:00.000Z' },
      { id: 'c', title: 'C', body: '', pinned: false, updatedAt: '2026-06-01T00:00:00.000Z' },
    ];
    expect(sortNotes(notes).map((n) => n.id)).toEqual(['b', 'c', 'a']);
  });
});

describe('useNotes', () => {
  it('adds a note and persists it', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.add('Acil', 'AFAD 122');
    });
    expect(result.current.notes).toHaveLength(1);
    expect(result.current.notes[0].title).toBe('Acil');
    expect(localStorage.getItem('prepturk:notes')).toContain('AFAD 122');
  });

  it('ignores an entirely empty note', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.add('   ', '  ');
    });
    expect(result.current.notes).toHaveLength(0);
  });

  it('defaults an empty title to "Başlıksız not"', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.add('', 'sadece gövde');
    });
    expect(result.current.notes[0].title).toBe('Başlıksız not');
  });

  it('pins, then sorts pinned first', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.add('first', 'x');
    });
    act(() => {
      result.current.add('second', 'y');
    });
    const lastId = result.current.notes[result.current.notes.length - 1].id;
    act(() => result.current.togglePin(lastId));
    expect(result.current.notes[0].id).toBe(lastId);
    expect(result.current.notes[0].pinned).toBe(true);
  });

  it('removes a note', () => {
    const { result } = renderHook(() => useNotes());
    act(() => {
      result.current.add('temp', 'body');
    });
    const id = result.current.notes[0].id;
    act(() => result.current.remove(id));
    expect(result.current.notes).toHaveLength(0);
  });
});
