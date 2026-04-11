import { render, screen } from '@testing-library/react';
import DashboardPage from '../dashboard/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe('DashboardPage shell integration', () => {
  it('renders the dashboard as an in-shell command center workspace', () => {
    render(<DashboardPage />);

    expect(screen.getByRole('heading', { name: /komuta merkezi/i })).toBeInTheDocument();
    expect(screen.getByText(/hizli erisim/i)).toBeInTheDocument();
    expect(screen.getByText(/yerel sistem durumu/i)).toBeInTheDocument();
    expect(screen.getByText(/operasyon ozeti/i)).toBeInTheDocument();
  });
});
