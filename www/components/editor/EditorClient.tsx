'use client';

import React, { useState } from 'react';
import EditorSidebar from './EditorSidebar';
import PreviewFrame from './PreviewFrame';
import { ProfileData } from "@/types/types";
import { getUserLinkedInProfile, getUserMediumBlogs, extractUsername } from "@/lib/api";

interface EditorClientProps {
    initialData: ProfileData;
    username: string;
}

import { Eye, Pencil } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import { createClient } from '@/lib/supabase/client';

export default function EditorClient({ initialData, username }: EditorClientProps) {
    const [data, setData] = useState<ProfileData>(initialData);
    const [activeTheme, setActiveTheme] = useState(initialData.customizations?.theme_id || 'default');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

    // Handle theme change
    const handleThemeChange = (themeId: string) => {
        setActiveTheme(themeId);
        setData(prev => ({
            ...prev,
            customizations: {
                ...prev.customizations,
                theme_id: themeId
            }
        }));
    };

    // Handle data updates from sidebar
    const handleDataUpdate = (newData: Partial<ProfileData>) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const [isFetching, setIsFetching] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const supabase = createClient();

    const handleSocialFetch = async (provider: string, url: string) => {
        const username = extractUsername(url, provider);
        if (!username) return;

        setIsFetching(true);
        try {
            if (provider === 'linkedin') {
                const linkedInData = await getUserLinkedInProfile(username);
                if (linkedInData) {
                    setData(prev => ({ ...prev, linkedin: linkedInData }));
                }
            } else if (provider === 'medium') {
                const mediumData = await getUserMediumBlogs(username);
                if (mediumData) {
                    setData(prev => ({ ...prev, blogs: mediumData }));
                }
            }
        } catch (error) {
            console.error(`Error fetching ${provider} data:`, error);
        } finally {
            setIsFetching(false);
        }
    };

    const handlePublish = async () => {
        console.log('handlePublish called');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session status:', !!session);

        if (!session) {
            console.log('No session, opening modal');
            setIsAuthModalOpen(true);
            return;
        }

        // Proceed with publish logic
        console.log('Publishing data:', data);
        // TODO: Implement actual publish call
    };

    return (
        <div className="flex w-full h-full relative overflow-hidden">
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
            {/* Left Sidebar - Customization Controls */}
            <AnimatePresence>
                {!isFullScreen && (mobileTab === 'editor') && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 400, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="border-r border-gray-200 bg-white flex flex-col overflow-hidden z-10 shrink-0 h-full absolute md:relative"
                    >
                        <div className="w-[400px] h-full overflow-y-auto">
                            <EditorSidebar
                                data={data}
                                activeTheme={activeTheme}
                                onThemeChange={handleThemeChange}
                                onDataUpdate={handleDataUpdate}
                                onSocialFetch={handleSocialFetch}
                                isFetching={isFetching}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Right Panel - Live Preview */}
            <motion.div
                layout
                className={`flex-1 bg-gray-100 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}`}
            >
                <PreviewFrame
                    username={username}
                    themeId={activeTheme}
                    data={data}
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                    onPublish={handlePublish}
                />
            </motion.div>

            {/* Mobile Toggle Button (Floating) */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setMobileTab(mobileTab === 'editor' ? 'preview' : 'editor')}
                    className="bg-black text-white p-4 rounded-full shadow-xl hover:bg-gray-900 transition-all active:scale-95"
                >
                    {mobileTab === 'editor' ? <Eye size={24} /> : <Pencil size={24} />}
                </button>
            </div>
        </div>
    );
}
