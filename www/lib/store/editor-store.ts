
import { create } from 'zustand';
import { ProfileData } from "@/types/types";
import { User } from '@supabase/supabase-js';

interface EditorState {
    // Data
    data: ProfileData | null;
    user: User | null; // Supabase user

    // UI State
    activeTheme: string;
    isFullScreen: boolean;
    mobileTab: 'editor' | 'preview';
    isMobile: boolean;
    isFetching: boolean;

    // Actions
    setData: (data: ProfileData) => void;
    updateData: (partial: Partial<ProfileData>) => void;
    setTheme: (themeId: string) => void;
    toggleFullScreen: () => void;
    setMobileTab: (tab: 'editor' | 'preview') => void;
    setIsMobile: (isMobile: boolean) => void;
    setIsFetching: (isFetching: boolean) => void;
    setUser: (user: User | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
    // Initial State
    data: null,
    user: null,
    activeTheme: 'default',
    isFullScreen: false,
    mobileTab: 'editor',
    isMobile: false,
    isFetching: false,

    // Actions
    setData: (data) => set({ data }),
    updateData: (partial) => set((state) => ({
        data: state.data ? { ...state.data, ...partial } : null
    })),
    setTheme: (themeId) => set((state) => {
        if (!state.data) return {};
        return {
            activeTheme: themeId,
            data: {
                ...state.data,
                customizations: {
                    ...state.data.customizations,
                    theme_id: themeId
                }
            }
        };
    }),
    toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen })),
    setMobileTab: (mobileTab) => set({ mobileTab }),
    setIsMobile: (isMobile) => set({ isMobile }),
    setIsFetching: (isFetching) => set({ isFetching }),
    setUser: (user) => set({ user }),
}));
