
import { create } from 'zustand';
import { ProfileData } from "@/types/types";
import { User } from '@supabase/supabase-js';

interface EditorState {
    // Data
    data: ProfileData | null;
    initialData: ProfileData | null;
    user: User | null; // Supabase user

    // UI State
    activeTheme: string;
    isFullScreen: boolean;
    mobileTab: 'editor' | 'preview';
    isMobile: boolean;
    isFetching: boolean;

    // History
    past: ProfileData[];
    future: ProfileData[];

    // Save Status
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';

    // Actions
    setData: (data: ProfileData) => void;
    setInitialData: (data: ProfileData) => void;
    syncInitialData: () => void;
    updateData: (partial: Partial<ProfileData>) => void;
    setTheme: (themeId: string) => void;
    toggleFullScreen: () => void;
    setMobileTab: (tab: 'editor' | 'preview') => void;
    setIsMobile: (isMobile: boolean) => void;
    setIsFetching: (isFetching: boolean) => void;
    setUser: (user: User | null) => void;
    undo: () => void;
    redo: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial State
    data: null,
    initialData: null,
    user: null,
    activeTheme: 'default',
    isFullScreen: false,
    mobileTab: 'editor',
    isMobile: false,
    isFetching: false,
    past: [],
    future: [],
    saveStatus: 'idle',

    // Actions
    setInitialData: (initialData) => set({ initialData }),
    syncInitialData: () => set((state) => ({ initialData: state.data })),

    setData: (data) => {
        const { data: currentData } = get();
        if (currentData) {
            set((state) => ({
                past: [...state.past, currentData],
                future: [],
                data,
                saveStatus: 'saving'
            }));
            setTimeout(() => set({ saveStatus: 'saved' }), 1000);
        } else {
            set({ data });
        }
    },
    updateData: (partial) => {
        const { data: currentData } = get();
        if (currentData) {
            const newData = { ...currentData, ...partial };
            set((state) => ({
                past: [...state.past, currentData],
                future: [],
                data: newData,
                saveStatus: 'saving'
            }));
            setTimeout(() => set({ saveStatus: 'saved' }), 1000);
        }
    },
    setTheme: (themeId) => set((state) => {
        if (!state.data) return {};
        const currentData = state.data;
        const newData = {
            ...currentData,
            customizations: {
                ...currentData.customizations,
                theme_id: themeId
            }
        };

        // Trigger save status for theme change too
        setTimeout(() => set({ saveStatus: 'saved' }), 1000);

        return {
            activeTheme: themeId,
            past: [...state.past, currentData],
            future: [],
            data: newData,
            saveStatus: 'saving'
        };
    }),
    toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
    setMobileTab: (mobileTab) => set({ mobileTab }),
    setIsMobile: (isMobile) => set({ isMobile }),
    setIsFetching: (isFetching) => set({ isFetching }),
    setUser: (user) => set({ user }),

    undo: () => set((state) => {
        if (state.past.length === 0) return {};
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);

        if (!state.data) return {};

        return {
            past: newPast,
            future: [state.data, ...state.future],
            data: previous,
            activeTheme: previous.customizations?.theme_id || 'default', // Sync activeTheme
            saveStatus: 'saved' // Undo counts as a save/change
        };
    }),

    redo: () => set((state) => {
        if (state.future.length === 0) return {};
        const next = state.future[0];
        const newFuture = state.future.slice(1);

        if (!state.data) return {};

        return {
            past: [...state.past, state.data],
            future: newFuture,
            data: next,
            activeTheme: next.customizations?.theme_id || 'default', // Sync activeTheme
            saveStatus: 'saved'
        };
    })
}));
