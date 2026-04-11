import { render, screen } from '@testing-library/react';
import SearchPage from '../search/page';

const replace = jest.fn();
const useSearch = jest.fn();
const useSearchFacets = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('q=AFAD'),
  useRouter: () => ({
    replace,
  }),
}));

jest.mock('../../hooks/useSearch', () => ({
  useSearch: (...args: unknown[]) => useSearch(...args),
  useSearchFacets: (...args: unknown[]) => useSearchFacets(...args),
}));

jest.mock('../../components/SearchBar', () => ({
  __esModule: true,
  default: () => <div>Komuta aramasi</div>,
}));

jest.mock('../../components/TrustBadge', () => ({
  __esModule: true,
  default: () => <span>Guven rozeti</span>,
}));

describe('SearchPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSearch.mockReturnValue({
      query: 'AFAD',
      setQuery: jest.fn(),
      page: 1,
      setPage: jest.fn(),
      officialOnly: true,
      setOfficialOnly: jest.fn(),
      sortBy: 'relevance',
      setSortBy: jest.fn(),
      results: [
        {
          id: 'doc-1',
          title: 'AFAD Tahliye Plani',
          subtitle: 'Il duzeyi referans',
          highlight: 'Tahliye koridorlari',
          category: 'Plan',
          institution: 'AFAD',
          trust_level: 'official',
          created_at: '2026-04-08T09:00:00.000Z',
        },
        {
          id: 'doc-2',
          title: 'AFAD Toplanma Rehberi',
          trust_level: 'official',
          created_at: '2026-04-07T09:00:00.000Z',
        },
      ],
      total: 2,
      totalPages: 1,
      isLoading: false,
      setFilters: jest.fn(),
      filters: {},
    });

    useSearchFacets.mockReturnValue({
      facets: {
        categories: { Plan: 2 },
        trust_levels: { official: 2 },
        institutions: { AFAD: 2 },
      },
    });
  });

  it('renders the search page as a compact in-shell search workspace', () => {
    render(<SearchPage />);

    expect(screen.queryByRole('heading', { name: /arama komuta konsolu/i })).not.toBeInTheDocument();
    expect(screen.getByText(/^sorgu durumu$/i)).toBeInTheDocument();
    expect(screen.getByText(/^filtre raflari$/i)).toBeInTheDocument();
    expect(screen.getByText(/^sonuc akisi$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sadece resmi kaynaklar/i })).toBeInTheDocument();
  });
});
