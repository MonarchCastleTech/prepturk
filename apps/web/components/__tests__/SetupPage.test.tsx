import { fireEvent, render, screen } from '@testing-library/react';
import SetupPage from '../../app/setup/page';

const push = jest.fn();
const markCompleted = jest.fn();
const useSetupStore = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
  }),
}));

jest.mock('../../lib/stores', () => ({
  useSetupStore: () => useSetupStore(),
}));

const baseStore = {
  language: 'tr',
  hostname: 'prepturk.local',
  lanAccess: true,
  selectedModules: ['documents', 'search', 'ai'],
  storageLimit: '50gb',
  aiModelProfile: 'local',
  contentPacks: ['mevzuat', 'egitim'],
  provincePack: '34',
  setLanguage: jest.fn(),
  setHostname: jest.fn(),
  setLanAccess: jest.fn(),
  setSelectedModules: jest.fn(),
  setStorageLimit: jest.fn(),
  setAiModelProfile: jest.fn(),
  setContentPacks: jest.fn(),
  setProvincePack: jest.fn(),
  setStep: jest.fn(),
  next: jest.fn(),
  prev: jest.fn(),
  markCompleted,
};

describe('SetupPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders device readiness copy instead of admin account fields', () => {
    useSetupStore.mockReturnValue({
      ...baseStore,
      step: 2,
      completedAt: null,
    });

    render(<SetupPage />);

    expect(screen.getByRole('heading', { name: /cihaz profili/i })).toBeInTheDocument();
    expect(screen.getByText(/yerel ya da lan modu/i)).toBeInTheDocument();
    expect(screen.queryByText(/kullanici adi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/gorunen ad/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sifre/i)).not.toBeInTheDocument();
  });

  it('marks setup complete and routes home when finishing', () => {
    useSetupStore.mockReturnValue({
      ...baseStore,
      step: 8,
      completedAt: null,
    });

    render(<SetupPage />);

    fireEvent.click(screen.getByRole('button', { name: /hazirligi tamamla/i }));

    expect(markCompleted).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/');
  });

  it('persists module and content pack changes to the setup store', () => {
    useSetupStore.mockReturnValue({
      ...baseStore,
      step: 3,
      completedAt: null,
    });

    const { rerender } = render(<SetupPage />);

    fireEvent.click(screen.getByRole('button', { name: /belge yonetimi/i }));

    expect(baseStore.setSelectedModules).toHaveBeenCalledWith(['search', 'ai']);

    useSetupStore.mockReturnValue({
      ...baseStore,
      step: 6,
      completedAt: null,
    });

    rerender(<SetupPage />);

    fireEvent.click(screen.getByRole('button', { name: /egitim materyalleri/i }));

    expect(baseStore.setContentPacks).toHaveBeenCalledWith(['mevzuat']);
  });

  it('describes province content as preinstalled instead of manually uploaded', () => {
    useSetupStore.mockReturnValue({
      ...baseStore,
      step: 7,
      completedAt: null,
    });

    render(<SetupPage />);

    expect(screen.getByText(/kurulumla birlikte hazır gelir/i)).toBeInTheDocument();
    expect(screen.queryByText(/manuel yükleyin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/paketi yükle/i)).not.toBeInTheDocument();
  });
});
