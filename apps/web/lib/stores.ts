import { create } from 'zustand';

// UI Store
interface UiState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  emergencyPanelOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setEmergencyPanelOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleCommandPalette: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  emergencyPanelOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setEmergencyPanelOpen: (open) => set({ emergencyPanelOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
}));

// Easy Mode Store
interface EasyModeState {
  isEasyMode: boolean;
  toggleEasyMode: () => void;
  setEasyMode: (v: boolean) => void;
}

export const useEasyModeStore = create<EasyModeState>((set) => ({
  isEasyMode: typeof window !== 'undefined' ? localStorage.getItem('prepturk:easyMode') === 'true' : false,
  toggleEasyMode: () => set((state) => {
    const newVal = !state.isEasyMode;
    if (typeof window !== 'undefined') localStorage.setItem('prepturk:easyMode', String(newVal));
    return { isEasyMode: newVal };
  }),
  setEasyMode: (v: boolean) => {
    if (typeof window !== 'undefined') localStorage.setItem('prepturk:easyMode', String(v));
    set({ isEasyMode: v });
  },
}));

// Document Filters Store
interface DocFilterState {
  category: string | null;
  province: string | null;
  institution: string | null;
  trustLevel: string | null;
  search: string;
  page: number;
  viewMode: 'grid' | 'list';
  setCategory: (v: string | null) => void;
  setProvince: (v: string | null) => void;
  setInstitution: (v: string | null) => void;
  setTrustLevel: (v: string | null) => void;
  setSearch: (v: string) => void;
  setPage: (v: number) => void;
  setViewMode: (v: 'grid' | 'list') => void;
  reset: () => void;
}

export const useDocFilterStore = create<DocFilterState>((set) => ({
  category: null,
  province: null,
  institution: null,
  trustLevel: null,
  search: '',
  page: 1,
  viewMode: 'grid',
  setCategory: (v) => set({ category: v, page: 1 }),
  setProvince: (v) => set({ province: v, page: 1 }),
  setInstitution: (v) => set({ institution: v, page: 1 }),
  setTrustLevel: (v) => set({ trustLevel: v, page: 1 }),
  setSearch: (v) => set({ search: v, page: 1 }),
  setPage: (v) => set({ page: v }),
  setViewMode: (v) => set({ viewMode: v }),
  reset: () =>
    set({
      category: null,
      province: null,
      institution: null,
      trustLevel: null,
      search: '',
      page: 1,
    }),
}));

// AI Chat Store
interface AIChatState {
  conversationId: string | null;
  messages: AIChatMessage[];
  mode: string;
  officialOnly: boolean;
  childSafe: boolean;
  explain15: boolean;
  stepByStep: boolean;
  setConversationId: (id: string | null) => void;
  addMessage: (msg: AIChatMessage) => void;
  setMode: (mode: string) => void;
  setOfficialOnly: (v: boolean) => void;
  setChildSafe: (v: boolean) => void;
  setExplain15: (v: boolean) => void;
  setStepByStep: (v: boolean) => void;
  clear: () => void;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: AICitation[];
  confidence?: string;
  timestamp: string;
}

export interface AICitation {
  document_id: string;
  citation_text: string;
  confidence_score: number;
}

export const useAIChatStore = create<AIChatState>((set) => ({
  conversationId: null,
  messages: [],
  mode: 'default',
  officialOnly: false,
  childSafe: true,
  explain15: false,
  stepByStep: false,
  setConversationId: (id) => set({ conversationId: id }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMode: (mode) => set({ mode }),
  setOfficialOnly: (v) => set({ officialOnly: v }),
  setChildSafe: (v) => set({ childSafe: v }),
  setExplain15: (v) => set({ explain15: v }),
  setStepByStep: (v) => set({ stepByStep: v }),
  clear: () => set({ conversationId: null, messages: [] }),
}));

// Setup Wizard Store
interface SetupState {
  step: number;
  language: string;
  hostname: string;
  lanAccess: boolean;
  selectedModules: string[];
  storageLimit: string;
  aiModelProfile: string;
  contentPacks: string[];
  provincePack: string | null;
  completedAt: string | null;
  setStep: (s: number) => void;
  next: () => void;
  prev: () => void;
  setLanguage: (v: string) => void;
  setHostname: (v: string) => void;
  setLanAccess: (v: boolean) => void;
  setSelectedModules: (v: string[]) => void;
  setStorageLimit: (v: string) => void;
  setAiModelProfile: (v: string) => void;
  setContentPacks: (v: string[]) => void;
  setProvincePack: (v: string | null) => void;
  markCompleted: () => void;
}

export const useSetupStore = create<SetupState>((set) => ({
  step: 1,
  language: 'tr',
  hostname: 'localhost',
  lanAccess: false,
  selectedModules: ['documents', 'search', 'ai', 'education', 'maps', 'vault', 'notes'],
  storageLimit: '50gb',
  aiModelProfile: 'local',
  contentPacks: ['mevzuat', 'egitim'],
  provincePack: null,
  completedAt: null,
  setStep: (s) => set({ step: s }),
  next: () => set((s) => ({ step: Math.min(s.step + 1, 8) })),
  prev: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
  setLanguage: (v) => set({ language: v }),
  setHostname: (v) => set({ hostname: v }),
  setLanAccess: (v) => set({ lanAccess: v }),
  setSelectedModules: (v) => set({ selectedModules: v }),
  setStorageLimit: (v) => set({ storageLimit: v }),
  setAiModelProfile: (v) => set({ aiModelProfile: v }),
  setContentPacks: (v) => set({ contentPacks: v }),
  setProvincePack: (v) => set({ provincePack: v }),
  markCompleted: () => set({ completedAt: new Date().toISOString() }),
}));

// Low Power Mode Store
interface PowerState {
  isLowPower: boolean;
  batteryLevel: number;
  isCharging: boolean;
  setLowPower: (v: boolean) => void;
  updateBattery: (level: number, charging: boolean) => void;
}

export const usePowerStore = create<PowerState>((set) => ({
  isLowPower: typeof window !== 'undefined'
    ? localStorage.getItem('prepturk:powerMode') === 'true'
    : false,
  batteryLevel: 100,
  isCharging: true,
  setLowPower: (v) => {
    if (typeof window !== 'undefined') localStorage.setItem('prepturk:powerMode', String(v));
    set({ isLowPower: v });
  },
  updateBattery: (level, charging) => set({ batteryLevel: level, isCharging: charging }),
}));
