import { render, screen } from '@testing-library/react';
import Chrome from '../Chrome';

const startTour = jest.fn();
let pathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

jest.mock('../Sidebar', () => ({
  __esModule: true,
  default: () => <div>Sidebar</div>,
}));

jest.mock('../TopBar', () => ({
  __esModule: true,
  default: () => <div>TopBar</div>,
}));

jest.mock('../CommandPalette', () => ({
  __esModule: true,
  default: () => <div>CommandPalette</div>,
}));

jest.mock('../EmergencyPanel', () => ({
  __esModule: true,
  default: () => <div>EmergencyPanel</div>,
}));

jest.mock('../SOSButton', () => ({
  __esModule: true,
  default: () => <div>SOSButton</div>,
}));

jest.mock('../../lib/tour', () => ({
  TourOverlay: () => <div>TourOverlay</div>,
  useTourStore: () => ({
    startTour,
  }),
  hasCompletedTour: () => false,
}));

jest.mock('../../lib/stores', () => ({
  useEasyModeStore: () => ({
    isEasyMode: false,
  }),
  usePowerStore: () => ({
    isLowPower: false,
  }),
  useUiStore: () => ({
    sidebarOpen: true,
  }),
}));

describe('Chrome', () => {
  beforeEach(() => {
    pathname = '/';
    jest.clearAllMocks();
  });

  it('renders shell chrome on the root route', () => {
    render(
      <Chrome>
        <div>Root content</div>
      </Chrome>
    );

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('TopBar')).toBeInTheDocument();
    expect(screen.getByText('Root content')).toBeInTheDocument();
  });

  it('renders shell chrome on the dashboard route', () => {
    pathname = '/dashboard';

    render(
      <Chrome>
        <div>Dashboard content</div>
      </Chrome>
    );

    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('TopBar')).toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
  });

  it('still skips shell chrome on excluded routes', () => {
    pathname = '/login';

    render(
      <Chrome>
        <div>Login content</div>
      </Chrome>
    );

    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument();
    expect(screen.queryByText('TopBar')).not.toBeInTheDocument();
    expect(screen.getByText('Login content')).toBeInTheDocument();
  });
});
