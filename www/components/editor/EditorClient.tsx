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

export default function EditorClient({ initialData, username }: EditorClientProps) {
    const [data, setData] = useState<ProfileData>(initialData);
    const [activeTheme, setActiveTheme] = useState(initialData.customizations?.theme_id || 'default');
    // const [isDirty, setIsDirty] = useState(false); // TODO: Implement save functionality

    const [isFullScreen, setIsFullScreen] = useState(false);

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
        // setIsDirty(true);
    };

    // Handle data updates from sidebar
    const handleDataUpdate = (newData: Partial<ProfileData>) => {
        setData(prev => ({ ...prev, ...newData }));
        // setIsDirty(true);
    };

    const [isFetching, setIsFetching] = useState(false);

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

    return (
        <div className="flex w-full h-full">
            {/* Left Sidebar - Customization Controls */}
            {!isFullScreen && (
                <div className="w-[400px] border-r border-gray-200 bg-white flex flex-col overflow-y-auto transition-all duration-300">
                    <EditorSidebar
                        data={data}
                        activeTheme={activeTheme}
                        onThemeChange={handleThemeChange}
                        onDataUpdate={handleDataUpdate}
                        onSocialFetch={handleSocialFetch}
                        isFetching={isFetching}
                    />
                </div>
            )}

            {/* Right Panel - Live Preview */}
            <div className="flex-1 bg-gray-100 p-8 flex flex-col items-center justify-center overflow-hidden transition-all duration-300">
                <PreviewFrame
                    username={username}
                    themeId={activeTheme}
                    data={data}
                    isFullScreen={isFullScreen}
                    onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
                />
            </div>
        </div>
    );
}
