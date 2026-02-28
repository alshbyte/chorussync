import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FontSize, ThemeMode } from '@/types/user';
import type { ScriptCode } from '@/types/song';

interface UIState {
  theme: ThemeMode;
  fontSize: FontSize;
  preferredScript: ScriptCode;
  hapticFeedback: boolean;
  showChords: boolean;
  autoScroll: boolean;
  sidebarOpen: boolean;

  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setPreferredScript: (script: ScriptCode) => void;
  toggleHapticFeedback: () => void;
  toggleShowChords: () => void;
  toggleAutoScroll: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      fontSize: 'medium',
      preferredScript: 'original',
      hapticFeedback: true,
      showChords: false,
      autoScroll: true,
      sidebarOpen: false,

      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },
      setFontSize: (fontSize) => set({ fontSize }),
      setPreferredScript: (preferredScript) => set({ preferredScript }),
      toggleHapticFeedback: () => set((s) => ({ hapticFeedback: !s.hapticFeedback })),
      toggleShowChords: () => set((s) => ({ showChords: !s.showChords })),
      toggleAutoScroll: () => set((s) => ({ autoScroll: !s.autoScroll })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    {
      name: 'chorussync-ui',
    }
  )
);
