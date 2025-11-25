'use client';

import React from 'react';
import { ProfileData } from "@/types/types";
import { Plus, Trash2, Github, Linkedin, Twitter, Globe, ChevronDown, Check } from 'lucide-react';


interface EditorSidebarProps {
    data: ProfileData;
    activeTheme: string;
    onThemeChange: (themeId: string) => void;
    onDataUpdate: (data: Partial<ProfileData>) => void;
}

export default function EditorSidebar({
    data,
    activeTheme,
    onThemeChange,
    onDataUpdate
}: EditorSidebarProps) {
    const [isThemeDropdownOpen, setIsThemeDropdownOpen] = React.useState(false);

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
                    <h2 className="text-sm font-medium text-gray-700">Socials</h2>
                    <button
                        onClick={() => {
                            const newSocials = [
                                ...(data.profile.social_accounts || []),
                                { provider: 'custom', url: '', display_name: 'New Link' }
                            ];
                            onDataUpdate({
                                profile: { ...data.profile, social_accounts: newSocials }
                            });
                        }}
                        className="text-xs flex items-center gap-1 text-black hover:text-gray-600 font-medium transition-colors"
                    >
                        <Plus size={14} />
                        Add
                    </button>
                </div>

                <div className="space-y-3">
                    {data.profile.social_accounts?.map((social, index) => (
                        <div key={index} className="flex items-start gap-2 group">
                            <div className="flex-1 space-y-2 p-3 border border-gray-200 rounded-lg bg-white group-hover:border-gray-300 transition-all">
                                <div className="flex items-center gap-2">
                                    {social.provider === 'github' && <Github size={16} className="text-gray-500" />}
                                    {social.provider === 'linkedin' && <Linkedin size={16} className="text-gray-500" />}
                                    {social.provider === 'twitter' && <Twitter size={16} className="text-gray-500" />}
                                    {social.provider !== 'github' && social.provider !== 'linkedin' && social.provider !== 'twitter' && (
                                        <Globe size={16} className="text-gray-500" />
                                    )}
                                    <input
                                        type="text"
                                        value={social.display_name}
                                        onChange={(e) => {
                                            const newSocials = [...(data.profile.social_accounts || [])];
                                            newSocials[index] = { ...social, display_name: e.target.value };
                                            onDataUpdate({
                                                profile: { ...data.profile, social_accounts: newSocials }
                                            });
                                        }}
                                        className="flex-1 text-sm font-medium text-gray-900 bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder-gray-400"
                                        placeholder="Label"
                                    />
                                </div>
                                <input
                                    type="text"
                                    value={social.url}
                                    onChange={(e) => {
                                        const newSocials = [...(data.profile.social_accounts || [])];
                                        newSocials[index] = { ...social, url: e.target.value };
                                        onDataUpdate({
                                            profile: { ...data.profile, social_accounts: newSocials }
                                        });
                                    }}
                                    className="w-full text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded px-2 py-1.5 focus:outline-none focus:border-gray-300 focus:bg-white transition-all"
                                    placeholder="https://..."
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const newSocials = data.profile.social_accounts.filter((_, i) => i !== index);
                                    onDataUpdate({
                                        profile: { ...data.profile, social_accounts: newSocials }
                                    });
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Remove"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {(!data.profile.social_accounts || data.profile.social_accounts.length === 0) && (
                        <div className="text-center py-6 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                            <p className="text-sm text-gray-500">No social links added yet</p>
                        </div>
                    )}
                </div>
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
