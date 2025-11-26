'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import MinimalResumeTheme from '@/themes/minimal-resume/components/MinimalResumeTheme';
import DefaultTheme from '@/themes/default/components/DefaultTheme';
import Image from 'next/image';
import { Monitor, Smartphone, Maximize, Minimize, Rocket } from 'lucide-react';
import { ProfileData } from "@/types/types";
import { motion } from 'framer-motion';
import UserMenu from '@/components/auth/UserMenu';

interface PreviewFrameProps {
    username: string;
    themeId: string;
    data: ProfileData;
    isFullScreen: boolean;
    onToggleFullScreen: () => void;
    onPublish?: () => void;
    user?: any;
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

export default function PreviewFrame({ username, themeId, data, isFullScreen, onToggleFullScreen, onPublish, user }: PreviewFrameProps) {
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
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Image
                        src="/images/logo-full.png"
                        alt="devb.io"
                        width={100}
                        height={32}
                        className="h-8 w-auto"
                        priority
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* User Profile */}
                    {user && (
                        <div className="mr-2">
                            <UserMenu user={user} />
                        </div>
                    )}

                    {/* View Mode Switcher */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'desktop'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Monitor size={16} />
                            <span>Desktop</span>
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'mobile'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Smartphone size={16} />
                            <span>Mobile</span>
                        </button>
                    </div>

                    <button
                        onClick={onToggleFullScreen}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                    >
                        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <button
                        onClick={() => {
                            console.log('Publish button clicked in PreviewFrame');
                            if (onPublish) onPublish();
                            else console.log('onPublish prop is missing');
                        }}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors shadow-lg shadow-black/5"
                    >
                        <Rocket size={16} />
                        <span>Publish</span>
                    </button>
                </div>
            </div>

            {/* Preview Container with Independent Scroll */}
            <div className="flex-1 relative overflow-auto bg-gray-100 p-8 flex items-center justify-center">
                <motion.div
                    layout
                    initial={false}
                    animate={{
                        width: viewMode === 'mobile' ? 375 : '100%',
                        height: viewMode === 'mobile' ? 667 : '100%',
                        borderRadius: viewMode === 'mobile' ? 48 : 0,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 25
                    }}
                    className={`bg-white border border-gray-200 overflow-hidden relative shadow-2xl`}
                >
                    {viewMode === 'mobile' ? (
                        <ResponsiveIframe
                            title="Mobile Preview"
                            className="w-full h-full border-0"
                        >
                            <div className="pt-4 px-4 min-h-full">
                                {renderTheme()}
                            </div>
                        </ResponsiveIframe>
                    ) : (
                        <div className="h-full w-full overflow-y-auto scrollbar-hide">
                            {renderTheme()}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
