import { render, screen } from '@testing-library/react';
import AIChatPage from '../ai-chat/page';
import VaultPage from '../vault/page';
import NotesPage from '../notes/page';

const useAIChat = jest.fn();
const useHomeworkMode = jest.fn();
const useSWR = jest.fn();
const apiPost = jest.fn();
const apiPut = jest.fn();
const apiDelete = jest.fn();

jest.mock('../../hooks/useAI', () => ({
  useAIChat: (...args: unknown[]) => useAIChat(...args),
}));

jest.mock('../../hooks/useHomeworkMode', () => ({
  useHomeworkMode: (...args: unknown[]) => useHomeworkMode(...args),
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: (...args: unknown[]) => useSWR(...args),
}));

jest.mock('../../lib/api', () => ({
  API_URL: 'http://localhost:8000',
  apiGet: jest.fn(),
  apiPost: (...args: unknown[]) => apiPost(...args),
  apiPut: (...args: unknown[]) => apiPut(...args),
  apiDelete: (...args: unknown[]) => apiDelete(...args),
}));

jest.mock('../../lib/stores', () => ({
  useAIChatStore: () => ({
    officialOnly: false,
    setOfficialOnly: jest.fn(),
    childSafe: false,
    setChildSafe: jest.fn(),
    explain15: false,
    setExplain15: jest.fn(),
    stepByStep: false,
    setStepByStep: jest.fn(),
  }),
}));

jest.mock('../../components/StatusChip', () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <span>{label}</span>,
}));

jest.mock('../../components/TrustBadge', () => ({
  __esModule: true,
  default: () => <span>Guven rozeti</span>,
}));

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('AI, vault, and notes workspaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useHomeworkMode.mockReturnValue({
      isHomeworkMode: false,
      toggleHomeworkMode: jest.fn(),
    });

    useAIChat.mockReturnValue({
      messages: [],
      send: jest.fn(),
      isSending: false,
    });

    useSWR.mockImplementation((key: string) => {
      if (key === '/vault/') {
        return {
          data: [
            {
              id: 'vault-1',
              original_name: 'Aile-plani.pdf',
              file_size_bytes: 1024,
              sha256: 'abcdef1234567890',
              encryption_algorithm: 'AES-256-GCM',
              mime_type: 'application/pdf',
              tags: ['aile'],
              created_at: '2026-04-09T10:00:00.000Z',
              updated_at: '2026-04-09T10:00:00.000Z',
            },
          ],
          mutate: jest.fn(),
        };
      }

      if (key === '/notes/') {
        return {
          data: [
            {
              id: 'note-1',
              title: 'Toplanma plani',
              content: 'Aile toplanma noktasi',
              note_type: 'general',
              is_pinned: true,
              is_emergency: false,
              province: 'Ankara',
              tags: ['aile'],
              created_at: '2026-04-09T10:00:00.000Z',
              updated_at: '2026-04-09T10:00:00.000Z',
            },
          ],
          mutate: jest.fn(),
        };
      }

      return { data: [], mutate: jest.fn() };
    });
  });

  it('renders ai chat as a structured in-shell workspace', () => {
    render(<AIChatPage />);

    expect(screen.getByRole('heading', { name: /ai asistan/i })).toBeInTheDocument();
    expect(screen.getByText(/^Modlar$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Sohbet Akisi$/i)).toBeInTheDocument();
    expect(screen.getByText(/nasil yardimci olabilirim/i)).toBeInTheDocument();
  });

  it('renders vault as a structured in-shell workspace', () => {
    render(<VaultPage />);

    expect(screen.getByRole('heading', { name: /kisisel kasa/i })).toBeInTheDocument();
    expect(screen.getByText(/^Sifreleme Durumu$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Dosya Yukleme$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Kasa Akisi$/i)).toBeInTheDocument();
  });

  it('renders notes as a structured in-shell workspace', () => {
    render(<NotesPage />);

    expect(screen.getByRole('heading', { name: /^Notlar$/i })).toBeInTheDocument();
    expect(screen.getByText(/^Not Ozeti$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Taslak Notu$/i)).toBeInTheDocument();
    expect(screen.getByText(/^Not Akisi$/i)).toBeInTheDocument();
    expect(screen.getByText('Toplanma plani')).toBeInTheDocument();
  });
});
