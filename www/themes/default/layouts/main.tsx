import { ThemeLayoutProps } from '@/types/theme';
import Image from 'next/image';
import Link from 'next/link';
import { TooltipProvider } from '@/components/ui/tooltip';

/**
 * Default Theme Layout
 * Wraps all pages in this theme with consistent layout
 */
export default function DefaultThemeLayout({
    theme,
    username,
    children
}: ThemeLayoutProps) {
    return (
        <TooltipProvider>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </TooltipProvider>
    );
}
