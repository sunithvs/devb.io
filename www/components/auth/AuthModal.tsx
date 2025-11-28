'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Github, Loader2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileData } from "@/types/types";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentData?: ProfileData;
    currentTheme?: string;
}

export default function AuthModal({ isOpen, onClose, currentData, currentTheme }: AuthModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleGitHubLogin = async () => {
        setIsLoading(true);
        try {
            // Save state before redirecting
            if (currentData) {
                localStorage.setItem('editor_backup_data', JSON.stringify(currentData));
            }
            if (currentTheme) {
                localStorage.setItem('editor_backup_theme', currentTheme);
            }

            // Save current URL to redirect back to
            // const returnUrl = window.location.href;

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
                },
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error logging in with GitHub:', error);
            setIsLoading(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <AnimatePresence>
                {isOpen && (
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
                                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Github className="h-6 w-6" />
                                    </div>

                                    <div className="space-y-2">
                                        <Dialog.Title className="text-xl font-bold text-gray-900">
                                            Sign in to devb.io
                                        </Dialog.Title>
                                        <Dialog.Description className="text-sm text-gray-500">
                                            Connect your GitHub account to publish your portfolio and save your changes.
                                        </Dialog.Description>
                                    </div>

                                    <button
                                        onClick={handleGitHubLogin}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-[#24292e] text-white px-4 py-3 rounded-xl font-medium hover:bg-[#2f363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Github className="h-5 w-5" />
                                        )}
                                        <span>Continue with GitHub</span>
                                    </button>

                                    <p className="text-xs text-gray-400">
                                        By clicking continue, you agree to our Terms of Service and Privacy Policy.
                                    </p>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}
