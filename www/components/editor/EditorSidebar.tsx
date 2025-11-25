'use client';

import React from 'react';
import { ProfileData } from '@/types/types';

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
    return (
        <div className="p-6 space-y-8">
            {/* Theme Selection */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Theme</h2>
                <div className="grid grid-cols-2 gap-3">
                    {['default', 'minimal-resume'].map((theme) => (
                        <button
                            key={theme}
                            onClick={() => onThemeChange(theme)}
                            className={`
                p-3 rounded-lg border text-left transition-all
                ${activeTheme === theme
                                    ? 'border-black bg-gray-50 ring-1 ring-black'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
              `}
                        >
                            <div className="font-medium capitalize">{theme.replace('-', ' ')}</div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Basic Info */}
            <section>
                <h2 className="text-lg font-semibold mb-4">Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            value={data.profile.name}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, name: e.target.value }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea
                            value={data.profile.bio || ''}
                            onChange={(e) => onDataUpdate({
                                profile: { ...data.profile, bio: e.target.value }
                            })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>
                </div>
            </section>

            <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                    More customization options coming soon...
                </p>
            </div>
        </div>
    );
}
