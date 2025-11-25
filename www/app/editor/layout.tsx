import React from 'react';

export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Main Content Area - Full Height minus header */}
            <main className="flex-1 flex overflow-hidden h-[calc(100vh-3.5rem)]">
                {children}
            </main>
        </div>
    );
}
