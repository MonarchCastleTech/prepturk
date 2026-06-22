import { render, screen } from '@testing-library/react';
import TrustBadge from '../TrustBadge';

describe('TrustBadge', () => {
  it('renders the Turkish label for a known trust level', () => {
    render(<TrustBadge level="official" />);
    expect(screen.getByText('Resmi')).toBeInTheDocument();
  });

  it('falls back to the raw level when unknown', () => {
    render(<TrustBadge level="mystery" />);
    expect(screen.getByText('mystery')).toBeInTheDocument();
  });

  it('hides the label when showLabel is false', () => {
    render(<TrustBadge level="personal" showLabel={false} />);
    expect(screen.queryByText('Kişisel')).toBeNull();
  });
});
