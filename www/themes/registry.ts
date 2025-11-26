import MinimalResumeTheme from '@/themes/minimal-resume/components/MinimalResumeTheme';
import DefaultTheme from '@/themes/default/components/DefaultTheme';
import { ProfileData } from "@/types/types";

export interface ThemeProps {
    data: ProfileData;
    username: string;
}

export type ThemeComponent = React.ComponentType<ThemeProps>;

export const themes: Record<string, ThemeComponent> = {
    'minimal-resume': MinimalResumeTheme,
    'default': DefaultTheme,
};

export const getTheme = (themeId: string): ThemeComponent => {
    return themes[themeId] || themes['default'];
};
