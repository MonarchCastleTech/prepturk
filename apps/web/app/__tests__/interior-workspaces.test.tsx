import { render, screen } from '@testing-library/react';
import ExamPage from '../sinav/page';
import HealthPage from '../saglik/page';
import MapsPage from '../maps/page';
import EmergencyPage from '../acil/page';

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const MockDynamicComponent = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    return MockDynamicComponent;
  },
}));

describe('Interior workspaces', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the exam page as a study command workspace', () => {
    render(<ExamPage />);

    expect(
      screen.getByRole('heading', { name: /sınav komuta merkezi/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/aktif hazırlık/i)).toBeInTheDocument();
    expect(screen.getByText(/bugünkü çalışma ritmi/i)).toBeInTheDocument();
  });

  it('renders the health page as a local dossier workspace', () => {
    render(<HealthPage />);

    expect(
      screen.getByRole('heading', { name: /sağlık dosyası/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/^Yerel sağlık özeti$/)).toBeInTheDocument();
    expect(screen.getByText(/^Acil iletişim halkası$/)).toBeInTheDocument();
  });

  it('renders the maps page as an offline field console', () => {
    render(<MapsPage />);

    expect(
      screen.getByRole('heading', { name: /saha harita konsolu/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Çevrimdışı katmanlar$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^Kayıtlı kritik noktalar$/).length).toBeGreaterThan(0);
  });

  it('renders the emergency page as a fast-response panel', () => {
    render(<EmergencyPage />);

    expect(
      screen.getByRole('heading', { name: /acil durum paneli/i })
    ).toBeInTheDocument();
    expect(screen.getAllByText(/^Kritik çağrı hatları$/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^İlk hareket adımları$/).length).toBeGreaterThan(0);
  });
});
