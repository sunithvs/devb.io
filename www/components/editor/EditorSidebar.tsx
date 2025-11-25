'use client';

import React from 'react';
import { ProfileData, SocialAccount } from "@/types/types";
import { extractUsername, detectProvider, isValidSocialUrl, SOCIAL_PLATFORMS } from "@/lib/api";
import { Plus, Trash2, Github, Linkedin, Twitter, Globe, ChevronDown, Check, Loader2, AlertCircle, Youtube, Gitlab, Twitch, Dribbble, Layers, Code2, Target, GripVertical, Instagram, Facebook, Mail, BookText } from 'lucide-react';
import { debounce } from 'lodash';
import { Reorder } from "framer-motion";


interface EditorSidebarProps {
    data: ProfileData;
    activeTheme: string;
    onThemeChange: (themeId: string) => void;
    onDataUpdate: (data: Partial<ProfileData>) => void;
    onSocialFetch?: (provider: string, url: string) => void;
    isFetching?: boolean;
}

export default function EditorSidebar({
    data,
    activeTheme,
    onThemeChange,
    onDataUpdate,
    onSocialFetch,
    isFetching
}: EditorSidebarProps) {
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = React.useState(false);

    // Local state for social accounts with stable IDs for drag and drop
    const [localSocials, setLocalSocials] = React.useState<(SocialAccount & { id: string })[]>([]);

    // Initialize local socials on mount or when data changes externally (careful to avoid loops)
    React.useEffect(() => {
        if (data.profile.social_accounts) {
            // Only update if length differs or if we don't have IDs yet
            // This is a simplification; ideally we track if it's an external update
            setLocalSocials(prev => {
                if (prev.length === data.profile.social_accounts.length && prev.every((p, i) => p.url === data.profile.social_accounts[i].url)) {
                    return prev;
                }
                return data.profile.social_accounts.map(s => ({ ...s, id: crypto.randomUUID() }));
            });
        }
    }, [data.profile.social_accounts]);

    const updateSocials = (newSocials: (SocialAccount & { id: string })[]) => {
        setLocalSocials(newSocials);
        onDataUpdate({
            profile: {
                ...data.profile,
                social_accounts: newSocials.map(s => ({
                    provider: s.provider,
                    url: s.url,
                    display_name: s.display_name
                }))
            }
        });
    };

    // Debounced fetch handler
    const debouncedFetch = React.useMemo(
        () => debounce((provider: string, url: string) => {
            if (onSocialFetch) {
                onSocialFetch(provider, url);
            }
        }, 1000),
        [onSocialFetch]
    );

    return (
        <div className="p-6 space-y-8">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold mb-6">Customise website</h1>

                {/* Website Domain */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website domain</label>
                    <div className="flex items-center w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black transition-all">
                        <input
                            type="text"
                            value={data.profile.username}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }
                            })}
                            className="flex-1 bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400"
                            placeholder="username"
                        />
                        <span className="text-gray-400 select-none">.devb.io</span>
                    </div>
                    <p className="mt-2 text-xs text-green-600 font-medium">Domain is available!</p>
                </div>
            </div>

            {/* Profile Information */}
            <section className="space-y-4">
                <h2 className="text-sm font-medium text-gray-700">Profile Information</h2>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Display Name</label>
                        <input
                            type="text"
                            value={data.profile.name}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, name: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                            placeholder="Your Name"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Bio (Short)</label>
                        <textarea
                            value={data.profile.bio || ''}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, bio: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-h-[60px]"
                            placeholder="Software Engineer @ Company..."
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">About (Long)</label>
                        <textarea
                            value={data.profile.about || ''}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, about: e.target.value }
                            })}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-h-[100px]"
                            placeholder="Tell your story..."
                        />
                    </div>
                </div>
            </section>

            {/* Theme Selection */}
            <section>
                <h2 className="text-sm font-medium text-gray-700 mb-3">Choose a theme</h2>
                <div className="relative">
                    <button
                        onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white flex items-center justify-between hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                    >
                        <span className="font-medium capitalize text-gray-900">
                            {activeTheme.replace('-', ' ')}
                        </span>
                        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isThemeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isThemeDropdownOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsThemeDropdownOpen(false)}
                            />
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                {['default', 'minimal-resume'].map((theme) => (
                                    <button
                                        key={theme}
                                        onClick={() => {
                                            onThemeChange(theme);
                                            setIsThemeDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${activeTheme === theme ? 'bg-gray-50' : ''}`}
                                    >
                                        <span className={`capitalize ${activeTheme === theme ? 'font-medium text-black' : 'text-gray-600'}`}>
                                            {theme.replace('-', ' ')}
                                        </span>
                                        {activeTheme === theme && <Check size={14} className="text-black" />}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Socials Section */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-medium text-gray-700">Socials</h2>
                        {isFetching && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                <span>Updating data...</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            const newSocial = {
                                provider: 'custom',
                                url: '',
                                display_name: '',
                                id: crypto.randomUUID()
                            };
                            // Add to TOP (unshift)
                            updateSocials([newSocial, ...localSocials]);
                        }}
                        className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                        <Plus size={14} />
                        Add
                    </button>
                </div>

                <Reorder.Group axis="y" values={localSocials} onReorder={updateSocials} className="space-y-3">
                    {localSocials.map((social, index) => (
                        <Reorder.Item key={social.id} value={social}>
                            <div className="flex items-start gap-2 group bg-white rounded-lg">
                                <div className="mt-4 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors">
                                    <GripVertical size={16} />
                                </div>
                                <div className="flex-1 space-y-2 p-3 border border-gray-200 rounded-lg group-hover:border-gray-300 transition-all">
                                    <div className="flex items-center gap-2">
                                        {/* Icon based on provider */}
                                        <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                            {social.provider === 'github' && <Github size={18} />}
                                            {social.provider === 'linkedin' && <Linkedin size={18} />}
                                            {social.provider === 'twitter' && <Twitter size={18} />}
                                            {social.provider === 'youtube' && <Youtube size={18} />}
                                            {social.provider === 'gitlab' && <Gitlab size={18} />}
                                            {social.provider === 'twitch' && <Twitch size={18} />}
                                            {social.provider === 'dribbble' && <Dribbble size={18} />}
                                            {social.provider === 'stackoverflow' && <Layers size={18} />}
                                            {social.provider === 'devto' && <Code2 size={18} />}
                                            {social.provider === 'producthunt' && <Target size={18} />}
                                            {social.provider === 'instagram' && <Instagram size={18} />}
                                            {social.provider === 'facebook' && <Facebook size={18} />}
                                            {social.provider === 'email' && <Mail size={18} />}
                                            {social.provider === 'medium' && <BookText size={18} />}
                                            {/* Generic icons for others */}
                                            {['custom', 'website', 'medium', 'behance', 'tiktok', 'discord', 'reddit'].includes(social.provider) && <Globe size={18} />}
                                        </div>
                                        <span className="flex-1 text-sm font-medium text-gray-900 capitalize">
                                            {SOCIAL_PLATFORMS[social.provider]?.name || social.provider}
                                        </span>
                                        <button
                                            onClick={() => {
                                                const newSocials = localSocials.filter((_, i) => i !== index);
                                                updateSocials(newSocials);
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={social.url}
                                            onChange={(e) => {
                                                const newSocials = [...localSocials];
                                                const newUrl = e.target.value;

                                                // Detect provider from URL
                                                const detectedProvider = detectProvider(newUrl);
                                                const isNewProvider = detectedProvider !== 'custom' && detectedProvider !== social.provider;
                                                const currentProvider = isNewProvider ? detectedProvider : social.provider;

                                                // Auto-generate label
                                                let newLabel = social.display_name;
                                                if (newUrl && (social.display_name === '' || social.display_name.includes('http') || isNewProvider)) {
                                                    const username = extractUsername(newUrl, currentProvider);
                                                    if (username) {
                                                        newLabel = currentProvider === 'linkedin' ? `in/${username}` :
                                                            currentProvider === 'medium' ? `@${username}` :
                                                                currentProvider === 'twitter' ? `@${username}` :
                                                                    username;
                                                    } else if (isNewProvider) {
                                                        newLabel = SOCIAL_PLATFORMS[currentProvider]?.name || currentProvider;
                                                    }
                                                }

                                                newSocials[index] = {
                                                    ...social,
                                                    url: newUrl,
                                                    display_name: newLabel,
                                                    provider: currentProvider
                                                };

                                                updateSocials(newSocials);

                                                // Trigger fetch if valid and supported
                                                const isValid = isValidSocialUrl(currentProvider, newUrl);
                                                if (isValid && SOCIAL_PLATFORMS[currentProvider]?.autoFetch) {
                                                    debouncedFetch(currentProvider, newUrl);
                                                }
                                            }}
                                            className={`w-full text-xs text-gray-500 bg-gray-50 border rounded px-2 py-1.5 focus:outline-none focus:bg-white transition-all ${!isValidSocialUrl(social.provider, social.url) && social.url
                                                ? 'border-red-300 focus:border-red-500'
                                                : 'border-gray-100 focus:border-gray-300'
                                                }`}
                                            placeholder="https://..."
                                        />
                                        {!isValidSocialUrl(social.provider, social.url) && social.url && (
                                            <div className="absolute right-2 bottom-2 text-red-500" title="Invalid URL format">
                                                <AlertCircle size={12} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}

                    {(!data.profile.social_accounts || data.profile.social_accounts.length === 0) && (
                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                            <p className="text-sm text-gray-500">No social links added yet</p>
                        </div>
                    )}
                </Reorder.Group>
            </section>

            {/* Create Website Button */}
            <div className="pt-4">
                <button className="w-full bg-black text-white font-medium py-3 rounded-lg hover:bg-gray-900 transition-colors shadow-lg shadow-black/5">
                    Create Website
                </button>
            </div>
        </div>
    );
}
