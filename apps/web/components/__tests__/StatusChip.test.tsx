import { render, screen } from '@testing-library/react';
import StatusChip from '../StatusChip';

describe('StatusChip', () => {
  it('renders the provided label', () => {
    render(<StatusChip status="success" label="Yüksek Güven" />);
    expect(screen.getByText('Yüksek Güven')).toBeInTheDocument();
  });

  it('applies the status-specific color classes', () => {
    const { container } = render(<StatusChip status="error" label="Hata" />);
    expect(container.firstChild).toHaveClass('text-red-300');
  });

  it('spins the icon while loading', () => {
    const { container } = render(<StatusChip status="loading" label="Yükleniyor" />);
    expect(container.querySelector('.animate-spin')).not.toBeNull();
  });
});
