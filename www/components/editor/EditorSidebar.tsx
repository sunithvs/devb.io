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
        <div className="p-6 space-y-8 bg-white min-h-screen">
            {/* Header Section */}
            <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">Edit Your Profile</h1>
                <p className="text-sm text-gray-500">Changes are saved automatically and shown in the preview.</p>
            </div>

            {/* Website Domain */}
            <section className="space-y-4">
                <h2 className="text-base font-bold text-gray-900">Domain</h2>
                <div className="flex items-center w-full px-4 py-3 bg-gray-100 rounded-lg focus-within:ring-2 focus-within:ring-black/5 transition-all">
                    <input
                        type="text"
                        value={data.profile.username}
                        onChange={(e) => onDataUpdate({
                            profile: { ...data.profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }
                        })}
                        className="flex-1 bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-400 font-medium text-sm"
                        placeholder="username"
                    />
                    <span className="text-gray-400 select-none text-sm font-medium">.devb.io</span>
                </div>
            </section>

            {/* Theme Selection */}
            <section className="space-y-4">
                <h2 className="text-base font-bold text-gray-900">Theme</h2>
                <div className="relative">
                    <button
                        onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                        className="w-full px-4 py-3 bg-gray-100 rounded-lg flex items-center justify-between hover:bg-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-black/5"
                    >
                        <span className="font-medium capitalize text-gray-900 text-sm">
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

            {/* Profile Information */}
            <section className="space-y-6">
                <h2 className="text-base font-bold text-gray-900">Profile</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Name</label>
                        <input
                            type="text"
                            value={data.profile.name}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, name: e.target.value }
                            })}
                            className="w-full px-4 py-3 text-sm bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400 font-medium text-gray-900"
                            placeholder="Your Name"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Bio</label>
                        <textarea
                            value={data.profile.bio || ''}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, bio: e.target.value }
                            })}
                            className="w-full px-4 py-3 text-sm bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all min-h-[80px] resize-none placeholder-gray-400 font-medium text-gray-900"
                            placeholder="Short bio..."
                        />
                    </div>
                </div>
            </section>

            {/* Socials Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-gray-900">Socials</h2>
                        {isFetching && (
                            <div className="flex items-center gap-1 text-xs text-blue-600 animate-pulse">
                                <Loader2 size={12} className="animate-spin" />
                                <span>Updating...</span>
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
                            updateSocials([newSocial, ...localSocials]);
                        }}
                        className="text-xs flex items-center gap-1 text-gray-500 hover:text-black font-medium transition-colors"
                    >
                        <Plus size={14} />
                        Add
                    </button>
                </div>

                <Reorder.Group axis="y" values={localSocials} onReorder={updateSocials} className="space-y-3">
                    {localSocials.map((social, index) => (
                        <Reorder.Item key={social.id} value={social}>
                            <div className="flex items-center gap-3 group">
                                {/* Drag Handle & Icon */}
                                <div className="flex items-center gap-3 text-gray-400 shrink-0">
                                    <div className="cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors">
                                        <GripVertical size={16} />
                                    </div>
                                    <div className="text-gray-500">
                                        {(() => {
                                            switch (social.provider) {
                                                case 'github': return <Github size={20} />;
                                                case 'linkedin': return <Linkedin size={20} />;
                                                case 'twitter': return <Twitter size={20} />;
                                                case 'youtube': return <Youtube size={20} />;
                                                case 'gitlab': return <Gitlab size={20} />;
                                                case 'twitch': return <Twitch size={20} />;
                                                case 'dribbble': return <Dribbble size={20} />;
                                                case 'stackoverflow': return <Layers size={20} />;
                                                case 'devto': return <Code2 size={20} />;
                                                case 'producthunt': return <Target size={20} />;
                                                case 'instagram': return <Instagram size={20} />;
                                                case 'facebook': return <Facebook size={20} />;
                                                case 'email': return <Mail size={20} />;
                                                case 'medium': return <BookText size={20} />;
                                                default: return <Globe size={20} />;
                                            }
                                        })()}
                                    </div>
                                </div>

                                {/* Input Field */}
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={social.url}
                                        onChange={(e) => {
                                            const newSocials = [...localSocials];
                                            const newUrl = e.target.value;
                                            const detectedProvider = detectProvider(newUrl);
                                            const isNewProvider = detectedProvider !== 'custom' && detectedProvider !== social.provider;
                                            const currentProvider = isNewProvider ? detectedProvider : social.provider;

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

                                            const isValid = isValidSocialUrl(currentProvider, newUrl);
                                            if (isValid && SOCIAL_PLATFORMS[currentProvider]?.autoFetch) {
                                                debouncedFetch(currentProvider, newUrl);
                                            }
                                        }}
                                        className={`w-full pl-4 py-3 text-sm bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400 font-medium text-gray-900 ${!isValidSocialUrl(social.provider, social.url) && social.url ? 'ring-2 ring-red-100 pr-16' : 'pr-10'}`}
                                        placeholder={`${SOCIAL_PLATFORMS[social.provider]?.name || 'Social'} URL`}
                                    />
                                    {!isValidSocialUrl(social.provider, social.url) && social.url && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" title="Invalid URL format">
                                            <AlertCircle size={16} />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            const newSocials = localSocials.filter((_, i) => i !== index);
                                            updateSocials(newSocials);
                                        }}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 ${!isValidSocialUrl(social.provider, social.url) && social.url ? 'mr-6' : ''} opacity-0 group-hover:opacity-100`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            </section>

            {/* About Section */}
            <section className="space-y-4">
                <h2 className="text-base font-bold text-gray-900">About</h2>
                <textarea
                    value={data.profile.about || ''}
                    onChange={(e) => onDataUpdate({
                        profile: { ...data.profile, about: e.target.value }
                    })}
                    className="w-full px-4 py-3 text-sm bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all min-h-[120px] resize-none placeholder-gray-400 font-medium text-gray-900"
                    placeholder="Tell your story..."
                />
            </section>

            {/* Location Section */}
            <section className="space-y-4">
                <h2 className="text-base font-bold text-gray-900">Location</h2>
                <input
                    type="text"
                    value={data.profile.location || ''}
                    onChange={(e) => onDataUpdate({
                        profile: { ...data.profile, location: e.target.value }
                    })}
                    className="w-full px-4 py-3 text-sm bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all placeholder-gray-400 font-medium text-gray-900"
                    placeholder="City, Country"
                />
            </section>
        </div>
    );
}
