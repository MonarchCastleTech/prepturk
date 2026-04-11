import { render, screen } from '@testing-library/react';
import HomePage from '../page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

describe('HomePage', () => {
  it('renders the root route as the in-shell command center workspace', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: /komuta merkezi/i })).toBeInTheDocument();
    expect(screen.getByText(/hizli erisim/i)).toBeInTheDocument();
    expect(screen.getByText(/yerel sistem durumu/i)).toBeInTheDocument();
    expect(screen.getByText(/operasyon ozeti/i)).toBeInTheDocument();
    expect(screen.queryByText(/hos geldiniz/i)).not.toBeInTheDocument();
  });
});
