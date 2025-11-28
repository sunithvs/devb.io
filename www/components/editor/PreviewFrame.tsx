'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getTheme } from '@/themes/registry';
import Image from 'next/image';
import { Monitor, Smartphone, Maximize, Minimize, Rocket, ChevronLeft, RotateCcw, RotateCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import UserMenu from '@/components/auth/UserMenu';
import MadeWithBadge from '@/components/ui/MadeWithBadge';
import { useEditorStore } from "@/lib/store/editor-store";

interface PreviewFrameProps {
    username: string;
    onPublish?: () => void;
    isPublishing?: boolean;
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

export default function PreviewFrame({ username, onPublish, isPublishing = false }: PreviewFrameProps) {
    const {
        data,
        activeTheme,
        isFullScreen,
        toggleFullScreen,
        user,
        undo,
        redo,
        past,
        future,
        saveStatus
    } = useEditorStore();

    const [viewMode, setViewMode] = useState<ViewMode>('desktop');

    // Render the selected theme component directly
    const renderTheme = () => {
        if (!data) return null;
        const ThemeComponent = getTheme(activeTheme);
        return <ThemeComponent data={data} username={username} />;
    };

    if (!data) return null;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="hidden md:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between shrink-0 relative">
                {/* Left: Logo & Navigation */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                        <ChevronLeft size={20} className="text-gray-400" />
                        <Image
                            src="/images/logo-full.png"
                            alt="devb.io"
                            width={100}
                            height={32}
                            className="h-8 w-auto"
                            priority
                        />
                    </div>
                    <div className="h-6 w-px bg-gray-200 mx-2" />
                    <div className="flex items-center gap-1">
                        <button
                            onClick={undo}
                            disabled={past.length === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Undo"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <button
                            onClick={redo}
                            disabled={future.length === 0}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Redo"
                        >
                            <RotateCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Center: View Controls */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('desktop')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'desktop'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Monitor size={16} />
                            <span className="hidden lg:inline">Desktop</span>
                        </button>
                        <button
                            onClick={() => setViewMode('mobile')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'mobile'
                                ? 'bg-white shadow-sm text-gray-900'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Smartphone size={16} />
                            <span className="hidden lg:inline">Mobile</span>
                        </button>
                    </div>

                    <div className="w-px h-6 bg-gray-200" />

                    <button
                        onClick={toggleFullScreen}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"}
                    >
                        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>

                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium ml-2 w-[80px]">
                        {saveStatus === 'saving' ? (
                            <>
                                <div className="h-3 w-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : saveStatus === 'saved' ? (
                            <>
                                <CheckCircle2 size={14} className="text-green-500" />
                                <span>Saved</span>
                            </>
                        ) : null}
                    </div>
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            console.log('Publish button clicked in PreviewFrame');
                            if (onPublish) onPublish();
                            else console.log('onPublish prop is missing');
                        }}
                        disabled={isPublishing}
                        className="hidden md:flex items-center gap-2 bg-[#B9FF66] text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#a3e635] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPublishing ? (
                            <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <Rocket size={16} />
                        )}
                        <span>{isPublishing ? 'Publishing...' : 'Publish'}</span>
                    </button>

                    <div className="h-6 w-px bg-gray-200" />

                    {/* User Profile */}
                    {user && (
                        <div className="">
                            <UserMenu user={user} />
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Container with Independent Scroll */}
            <div className="flex-1 relative overflow-auto bg-gray-100 p-0 md:p-4 flex items-center justify-center">
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
                                <MadeWithBadge />
                            </div>
                        </ResponsiveIframe>
                    ) : (
                        <div className="h-full w-full overflow-y-auto scrollbar-hide relative">
                            {renderTheme()}
                            <MadeWithBadge />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
