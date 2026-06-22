import { render } from '@testing-library/react';
import InstallPrompt from '../InstallPrompt';

describe('InstallPrompt', () => {
  it('renders nothing until the browser fires beforeinstallprompt', () => {
    const { container } = render(<InstallPrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not throw when matchMedia is unavailable (jsdom/SSR)', () => {
    expect(() => render(<InstallPrompt />)).not.toThrow();
  });
});
