import { act } from 'react';
import MapsPage from '../maps/page';

const { MessageChannel } = require('node:worker_threads');
const { TextDecoder, TextEncoder } = require('node:util');
const trackedChannels: InstanceType<typeof MessageChannel>[] = [];

class TrackingMessageChannel extends MessageChannel {
  constructor() {
    super();
    trackedChannels.push(this);
  }
}

(global as typeof globalThis & { MessageChannel?: typeof MessageChannel }).MessageChannel = TrackingMessageChannel;
(global as typeof globalThis & { TextEncoder?: typeof TextEncoder }).TextEncoder = TextEncoder;
(global as typeof globalThis & { TextDecoder?: typeof TextDecoder }).TextDecoder = TextDecoder;

const { hydrateRoot } = require('react-dom/client');
const { renderToString } = require('react-dom/server');

jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: () => {
    const MockDynamicComponent = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
    return MockDynamicComponent;
  },
}));

describe('MapsPage hydration', () => {
  it('does not create a server/client markup mismatch', async () => {
    const originalWindow = global.window;
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate the server pass where `window` is unavailable.
    Object.defineProperty(global, 'window', { value: undefined, configurable: true });
    const serverHtml = renderToString(<MapsPage />);

    Object.defineProperty(global, 'window', { value: originalWindow, configurable: true });
    document.body.innerHTML = `<div id="root">${serverHtml}</div>`;

    const container = document.getElementById('root');
    if (!container) {
      throw new Error('Root container was not created');
    }

    let root: ReturnType<typeof hydrateRoot> | null = null;

    await act(async () => {
      root = hydrateRoot(container, <MapsPage />);
      await Promise.resolve();
    });

    expect(container.querySelector('h1')?.textContent).toBe('Haritalar');
    expect(container.textContent).not.toContain('Saha Harita Konsolu');

    const messages = consoleError.mock.calls.flat().join(' ');
    expect(messages).not.toMatch(/hydration/i);
    expect(messages).not.toMatch(/did not match/i);

    root?.unmount();
    trackedChannels.splice(0).forEach((channel) => {
      channel.port1.close();
      channel.port2.close();
    });
    consoleError.mockRestore();
  });
});
