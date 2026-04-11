import { render, screen } from '@testing-library/react';
import ProvincePacksPage from '../province-packs/page';

const useSWR = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => useSWR(...args),
}));

describe('ProvincePacksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders province packs as a compact in-shell inventory', () => {
    useSWR.mockReturnValue({
      data: [],
    });

    render(<ProvincePacksPage />);

    expect(screen.getByRole('heading', { name: /il paketleri/i })).toBeInTheDocument();
    expect(screen.getByText(/il icerikleri, surum durumu ve belge kapsami/i)).toBeInTheDocument();
    expect(screen.getByText(/hazir kapsam/i)).toBeInTheDocument();
    expect(screen.getAllByText(/etkinlestirme bekliyor/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /paket icerikleri/i })).toBeInTheDocument();
    expect(screen.queryByText(/kurulumla hazir il envanteri/i)).not.toBeInTheDocument();
  });
});
