import { render, screen } from '@testing-library/react';
import Sidebar from '../Sidebar';

const toggleSidebar = jest.fn();
let pathname = '/dashboard';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

jest.mock('../../lib/stores', () => ({
  useUiStore: () => ({
    sidebarOpen: true,
    toggleSidebar,
  }),
  useEasyModeStore: () => ({
    isEasyMode: false,
  }),
  usePowerStore: () => ({
    isLowPower: false,
  }),
}));

describe('Sidebar', () => {
  beforeEach(() => {
    pathname = '/dashboard';
  });

  it('renders the command hierarchy with a lighter shell identity block', () => {
    render(<Sidebar />);

    expect(screen.getByText(/prepturk/i)).toBeInTheDocument();
    expect(screen.getByText(/^komuta$/i)).toBeInTheDocument();
    expect(screen.getByText(/bilgi ve haz/i)).toBeInTheDocument();
    expect(screen.getAllByText(/saha mod/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/yerel durum/i)).toBeInTheDocument();
    expect(screen.queryByText(/komuta hatt/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cikis yap/i })).not.toBeInTheDocument();
  });

  it('auto-expands the active field section for nested routes', () => {
    pathname = '/su-aritma';

    render(<Sidebar />);

    expect(screen.getByRole('link', { name: /su ar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hayatta kalma/i })).toBeInTheDocument();
  });
});
