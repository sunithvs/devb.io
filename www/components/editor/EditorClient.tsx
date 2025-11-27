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
    const [isMobile, setIsMobile] = useState(false);

    // Handle window resize to detect mobile
    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    // Restore state and fetch user on mount
    React.useEffect(() => {
        // Restore state
        const savedData = localStorage.getItem('editor_backup_data');
        const savedTheme = localStorage.getItem('editor_backup_theme');

        if (savedData) {
            try {
                setData(JSON.parse(savedData));
                localStorage.removeItem('editor_backup_data');
            } catch (e) {
                console.error('Failed to parse saved data', e);
            }
        }

        if (savedTheme) {
            setActiveTheme(savedTheme);
            localStorage.removeItem('editor_backup_theme');
        }

        // Fetch user
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

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
                currentData={data}
                currentTheme={activeTheme}
            />
            {/* Left Sidebar - Customization Controls */}
            <AnimatePresence mode="wait">
                {(!isMobile || mobileTab === 'editor') && !isFullScreen && (
                    <motion.div
                        key="sidebar"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="border-r border-gray-200 bg-white flex flex-col overflow-hidden z-10 shrink-0 h-full w-full md:w-[400px] absolute md:relative pb-20 md:pb-0"
                    >
                        <div className="w-full h-full overflow-y-auto">
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
            <AnimatePresence mode="wait">
                {(!isMobile || mobileTab === 'preview') && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`flex-1 bg-gray-100 flex flex-col items-center justify-center overflow-hidden w-full h-full absolute md:relative pb-20 md:pb-0`}
                    >
                        <PreviewFrame
                            username={username}
                            themeId={activeTheme}
                            data={data}
                            isFullScreen={isFullScreen}
                            onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                            onPublish={handlePublish}
                            user={user}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 z-50 flex items-center gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <button
                    onClick={() => setMobileTab(mobileTab === 'editor' ? 'preview' : 'editor')}
                    className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-900 font-medium text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    {mobileTab === 'editor' ? (
                        <>
                            <Eye size={18} />
                            Preview
                        </>
                    ) : (
                        <>
                            <Pencil size={18} />
                            Edit
                        </>
                    )}
                </button>
                <button
                    onClick={handlePublish}
                    className="flex-1 py-3 px-4 rounded-lg bg-[#a3e635] text-black font-bold text-sm hover:bg-[#8cd321] transition-colors shadow-sm"
                >
                    Save Changes
                </button>
            </div>


        </div>
    );
}
