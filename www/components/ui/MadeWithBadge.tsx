'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function MadeWithBadge() {
    return (
        <Link
            href="https://devb.io"
            target="_blank"
            className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-100 hover:scale-105 transition-transform group"
        >
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-900 transition-colors">
                Made in
            </span>
            <Image
                src="/images/logo-full.png"
                alt="devb.io"
                width={60}
                height={20}
                className="h-4 w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity"
            />
        </Link>
    );
}
