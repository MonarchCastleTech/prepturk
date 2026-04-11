import { render, screen } from '@testing-library/react';
import DocumentsPage from '../documents/page';

const useDocuments = jest.fn();
const useDocumentCount = jest.fn();

const filterStore = {
  page: 1,
  category: null,
  province: null,
  institution: null,
  trustLevel: null,
  search: '',
  viewMode: 'grid' as const,
  setCategory: jest.fn(),
  setProvince: jest.fn(),
  setInstitution: jest.fn(),
  setTrustLevel: jest.fn(),
  setViewMode: jest.fn(),
  setPage: jest.fn(),
  reset: jest.fn(),
};

jest.mock('../../hooks/useDocuments', () => ({
  useDocuments: (...args: unknown[]) => useDocuments(...args),
  useDocumentCount: (...args: unknown[]) => useDocumentCount(...args),
}));

jest.mock('../../lib/stores', () => ({
  useDocFilterStore: () => filterStore,
}));

jest.mock('../../components/SearchBar', () => ({
  __esModule: true,
  default: () => <div>Arama alani</div>,
}));

jest.mock('../../components/DocumentCard', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <article>{title}</article>,
}));

describe('DocumentsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDocuments.mockReturnValue({
      documents: [
        {
          id: 'doc-1',
          title: 'AFAD Il Plani',
        },
      ],
      isLoading: false,
    });
    useDocumentCount.mockReturnValue({ total: 12 });
  });

  it('renders the documents page as a compact in-shell workspace', () => {
    render(<DocumentsPage />);

    expect(screen.queryByRole('heading', { name: /yerel belge komuta merkezi/i })).not.toBeInTheDocument();
    expect(screen.getByText(/^arsiv durumu$/i)).toBeInTheDocument();
    expect(screen.getByText(/^filtre raflari$/i)).toBeInTheDocument();
    expect(screen.getByText(/^belge akisi$/i)).toBeInTheDocument();
    expect(screen.getByText('AFAD Il Plani')).toBeInTheDocument();
  });
});
