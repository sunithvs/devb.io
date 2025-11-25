import { ThemeLayoutProps } from '@/types/theme';
import '../styles/theme.css';

/**
 * Minimal Resume Theme Layout
 * Clean black and white design
 */
export default function MinimalResumeLayout({
    children
}: ThemeLayoutProps) {
    return (
        <div className="minimal-resume-theme">
            {children}
        </div>
    );
}
