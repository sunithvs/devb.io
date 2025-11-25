'use client';

import React, { useState } from 'react';
import EditorSidebar from './EditorSidebar';
import PreviewFrame from './PreviewFrame';
import {ProfileData} from "@/types/types";

interface EditorClientProps {
    initialData: ProfileData;
    username: string;
}

export default function EditorClient({ initialData, username }: EditorClientProps) {
    const [data, setData] = useState<ProfileData>(initialData);
    const [activeTheme, setActiveTheme] = useState(initialData.customizations?.theme_id || 'default');
    // const [isDirty, setIsDirty] = useState(false); // TODO: Implement save functionality

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

    return (
        <div className="flex w-full h-full">
            {/* Left Sidebar - Customization Controls */}
            <div className="w-[400px] border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
                <EditorSidebar
                    data={data}
                    activeTheme={activeTheme}
                    onThemeChange={handleThemeChange}
                    onDataUpdate={handleDataUpdate}
                />
            </div>

            {/* Right Panel - Live Preview */}
            <div className="flex-1 bg-gray-100 p-8 flex flex-col items-center justify-center overflow-hidden">
                <PreviewFrame
                    username={username}
                    themeId={activeTheme}
                    data={data}
                />
            </div>
        </div>
    );
}
