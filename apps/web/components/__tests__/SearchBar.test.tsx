import { fireEvent, render, screen } from '@testing-library/react';
import SearchBar from '../SearchBar';

const push = jest.fn();
const useSearchSuggestions = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

jest.mock('../../hooks/useSearch', () => ({
  useSearchSuggestions: (...args: unknown[]) => useSearchSuggestions(...args),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearchSuggestions.mockReturnValue({ suggestions: [] });
  });

  it('syncs incoming values and can search locally without navigation', () => {
    const handleSearch = jest.fn();
    const { rerender } = render(
      <SearchBar initialValue="AFAD" navigateTo={null} onSearch={handleSearch} placeholder="Yerel arama" />
    );

    const input = screen.getByRole('textbox', { name: /yerel arama/i });
    expect(input).toHaveValue('AFAD');

    rerender(<SearchBar initialValue="MEB" navigateTo={null} onSearch={handleSearch} placeholder="Yerel arama" />);
    expect(input).toHaveValue('MEB');

    fireEvent.change(input, { target: { value: 'İstanbul' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    expect(handleSearch).toHaveBeenLastCalledWith('İstanbul');
    expect(push).not.toHaveBeenCalled();
  });

  it('clears the query and routes back to the search workspace by default', () => {
    render(<SearchBar initialValue="AFAD" placeholder="Komuta araması" />);

    fireEvent.click(screen.getByRole('button', { name: /aramayı temizle/i }));

    expect(push).toHaveBeenCalledWith('/search');
  });
});
