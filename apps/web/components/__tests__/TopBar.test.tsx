import { render, screen } from '@testing-library/react';
import TopBar from '../TopBar';

const push = jest.fn();
const setCommandPaletteOpen = jest.fn();
const startTour = jest.fn();
let sidebarOpen = false;
let isEasyMode = false;

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

jest.mock('../../lib/stores', () => ({
  useUiStore: () => ({
    setCommandPaletteOpen,
    sidebarOpen,
  }),
  useEasyModeStore: () => ({
    isEasyMode,
  }),
}));

jest.mock('../../lib/tour', () => ({
  useTourStore: () => ({
    startTour,
  }),
}));

jest.mock('../EasyModeToggle', () => ({
  __esModule: true,
  default: () => <button type="button">Easy Mode</button>,
}));

describe('TopBar', () => {
  beforeEach(() => {
    sidebarOpen = false;
    isEasyMode = false;
  });

  it('renders a slim utility bar instead of repeating the page title block', () => {
    render(<TopBar />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText(/cevrimdisi/i)).toBeInTheDocument();
    expect(screen.getByText(/yerel indeks/i)).toBeInTheDocument();
    expect(screen.queryByText(/belge kutuphanesi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/yerel arsiv akisi/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /navigasyonu/i })).toBeInTheDocument();
  });

  it('uses the full sidebar offset in easy mode even when the sidebar is collapsed', () => {
    isEasyMode = true;

    const { container } = render(<TopBar />);

    expect(container.firstChild).toHaveClass('left-0');
    expect(container.firstChild).toHaveClass('lg:left-[var(--shell-sidebar-width)]');
    expect(container.firstChild).not.toHaveClass('lg:left-[var(--shell-sidebar-collapsed-width)]');
  });
});
