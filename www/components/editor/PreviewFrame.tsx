'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ProfileData } from '@/types/types';
import MinimalResumeTheme from '@/themes/minimal-resume/components/MinimalResumeTheme';
import DefaultTheme from '@/themes/default/components/DefaultTheme';
import { Monitor, Smartphone } from 'lucide-react';

interface PreviewFrameProps {
    username: string;
    themeId: string;
    data: ProfileData;
}

type ViewMode = 'desktop' | 'mobile';

const ResponsiveIframe = ({
    children,
    title,
    className,
    style
}: {
    children: React.ReactNode;
    title: string;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;

        const doc = iframe.contentDocument;
        if (!doc) return;

        // Set up the iframe document
        doc.open();
        doc.write('<!DOCTYPE html><html><head></head><body></body></html>');
        doc.close();

        // Copy styles from main document
        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
        styles.forEach(style => {
            doc.head.appendChild(style.cloneNode(true));
        });

        // Add base styles to body
        doc.body.style.margin = '0';
        doc.body.style.padding = '0';
        doc.body.style.overflowX = 'hidden';
        doc.body.style.backgroundColor = '#ffffff'; // Ensure white background

        setMountNode(doc.body);
    }, []);

    return (
        <iframe
            ref={iframeRef}
            title={title}
            className={className}
            style={style}
        >
            {mountNode && createPortal(children, mountNode)}
        </iframe>
    );
};

export default function PreviewFrame({ username, themeId, data }: PreviewFrameProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');

    // Render the selected theme component directly
    const renderTheme = () => {
        switch (themeId) {
            case 'minimal-resume':
                return <MinimalResumeTheme data={data} username={username} />;
            case 'default':
            default:
                return <DefaultTheme data={data} username={username} />;
        }
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="bg-white border border-gray-200 border-b-0 rounded-t-lg px-4 py-2 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>

                {/* View Mode Switcher */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setViewMode('desktop')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        title="Desktop View"
                    >
                        <Monitor size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        title="Mobile View"
                    >
                        <Smartphone size={16} />
                    </button>
                </div>

                <div className="w-16"></div>
            </div>

            {/* Preview Container with Independent Scroll */}
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded-b-lg shadow-inner overflow-hidden relative flex justify-center">
                <div className={`transition-all duration-300 shadow-sm bg-white ${viewMode === 'mobile'
                        ? 'w-[375px] h-[667px] my-8 border border-gray-300 rounded-xl overflow-hidden'
                        : 'w-full h-full'
                    }`}>
                    {viewMode === 'mobile' ? (
                        <ResponsiveIframe
                            title="Mobile Preview"
                            className="w-full h-full border-0"
                        >
                            {renderTheme()}
                        </ResponsiveIframe>
                    ) : (
                        <div className="w-full h-full overflow-y-auto">
                            {renderTheme()}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
