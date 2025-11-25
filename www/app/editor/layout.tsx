import React from 'react';

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Simple Header */}
            <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between h-14">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">devb.io</span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">Editor</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Editing as sunithvs</span>
                </div>
            </header>

            {/* Main Content Area - Full Height minus header */}
            <main className="flex-1 flex overflow-hidden h-[calc(100vh-3.5rem)]">
                {children}
            </main>
        </div>
    );
}
