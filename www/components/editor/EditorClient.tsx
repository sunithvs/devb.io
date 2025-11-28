'use client';

import React, { useEffect } from 'react';
import EditorSidebar from './EditorSidebar';
import PreviewFrame from './PreviewFrame';
import { ProfileData } from "@/types/types";
import { useEditorStore } from "@/lib/store/editor-store";

interface EditorClientProps {
    initialData: ProfileData;
    username: string;
    isOwner?: boolean;
}

import { Eye, Pencil, AlertTriangle, LogOut, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthModal from '@/components/auth/AuthModal';
import { createClient } from '@/lib/supabase/client';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';

export default function EditorClient({ initialData, username, isOwner = false }: EditorClientProps) {
    // Zustand Store
    const {
        data,
        activeTheme,
        isFullScreen,
        mobileTab,
        isMobile,
        setData,
        setTheme,
        setMobileTab,
        setIsMobile,
        setUser
    } = useEditorStore();

    // Initialize Store with Server Data
    const initialized = React.useRef(false);
    if (!initialized.current) {
        useEditorStore.setState({
            data: initialData,
            activeTheme: initialData.customizations?.theme_id || 'default'
        });
        initialized.current = true;
    }

    // Handle window resize to detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, [setIsMobile]);

    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
    const supabase = createClient();

    // Restore state and fetch user on mount
    const [isConflictModalOpen, setIsConflictModalOpen] = React.useState(false);
    const [conflictUser, setConflictUser] = React.useState<string | null>(null);
    const router = useRouter();

    // Restore state and fetch user on mount
    useEffect(() => {
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
            setTheme(savedTheme);
            localStorage.removeItem('editor_backup_theme');
        }

        // Fetch user
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Check for conflict: Logged in but viewing someone else's profile
            if (user && !isOwner) {
                const loggedInUsername = user.user_metadata?.user_name;
                if (loggedInUsername && loggedInUsername !== username) {
                    setConflictUser(loggedInUsername);
                    setIsConflictModalOpen(true);
                }
            }
        };
        getUser();
    }, [isOwner, username, setData, setTheme, setUser, supabase.auth]);

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

    if (!data) return null;

    return (
        <div className="flex w-full h-full relative overflow-hidden">
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                currentData={data}
                currentTheme={activeTheme}
            />

            {/* Conflict Modal */}
            <Dialog.Root open={isConflictModalOpen} onOpenChange={setIsConflictModalOpen}>
                <AnimatePresence>
                    {isConflictModalOpen && (
                        <Dialog.Portal forceMount>
                            <Dialog.Overlay asChild>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                                />
                            </Dialog.Overlay>
                            <Dialog.Content asChild>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-xl rounded-2xl focus:outline-none"
                                >
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>

                                        <div className="space-y-2">
                                            <Dialog.Title className="text-xl font-bold text-gray-900">
                                                You are editing {username}
                                            </Dialog.Title>
                                            <Dialog.Description className="text-sm text-gray-500">
                                                You are currently logged in as <span className="font-semibold text-gray-900">{conflictUser}</span>.
                                                Edits made here will not be saved to your profile.
                                            </Dialog.Description>
                                        </div>

                                        <div className="flex flex-col gap-3 w-full pt-2">
                                            <button
                                                onClick={() => router.push('/editor')}
                                                className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                                            >
                                                <User className="h-4 w-4" />
                                                <span>Go to My Profile</span>
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    await supabase.auth.signOut();
                                                    setIsConflictModalOpen(false);
                                                    window.location.reload();
                                                }}
                                                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout & Continue Here</span>
                                            </button>
                                            <button
                                                onClick={() => setIsConflictModalOpen(false)}
                                                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                Stay here (edits won&apos;t save to your profile)
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </Dialog.Content>
                        </Dialog.Portal>
                    )}
                </AnimatePresence>
            </Dialog.Root>
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
                            <EditorSidebar />
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
                            onPublish={handlePublish}
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
