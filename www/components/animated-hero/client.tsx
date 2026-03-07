'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import GitHubModal from '../github-modal/client';
import { Info, Github, GitFork } from 'lucide-react';
import Counter from '../counter';

export default function AnimatedHeroClient() {
    const [showGithubModal, setShowGithubModal] = useState(false);

    useEffect(() => {
        // Check if URL has modal=true parameter
        const searchParams = new URLSearchParams(window.location.search);
        const shouldShowModal = searchParams.get('modal') === 'true';

        if (shouldShowModal) {
            setShowGithubModal(true);
        }
    }, []);

    return (
        <section className="w-full flex flex-col items-center justify-center pb-16 md:pb-24">
            {/* Trusted badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center mb-8 md:mb-10 w-full px-2"
            >
                <Image
                    src="/images/leaf-l.png"
                    alt="Laurel left"
                    width={28}
                    height={52}
                    className="w-auto h-8 md:h-12 opacity-80 shrink-0"
                />
                <div className="flex items-center gap-2 md:gap-3 mx-2 md:mx-4">
                    <div className="flex -space-x-3 shrink-0">
                        <Image
                            src="https://avatars.githubusercontent.com/u/63339782?v=4"
                            alt="Customer 1"
                            width={36}
                            height={36}
                            priority
                            className="w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-white object-cover shadow-sm relative z-0"
                        />
                        <Image
                            src="https://avatars.githubusercontent.com/u/93549213?v=4"
                            alt="Customer 2"
                            width={36}
                            height={36}
                            priority
                            className="w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-white object-cover shadow-sm relative z-10"
                        />
                        <Image
                            src="https://avatars.githubusercontent.com/u/135146135?v=4"
                            alt="Customer 3"
                            width={36}
                            height={36}
                            priority
                            className="w-7 h-7 md:w-9 md:h-9 rounded-full border-2 border-white bg-purple-100 object-cover shadow-sm relative z-20"
                        />
                    </div>
                    <span className="text-sm md:text-[17px] font-medium text-[#7a7a7a] tracking-tight whitespace-nowrap">
                        Trusted by 2k+ Customers
                    </span>
                </div>
                <Image
                    src="/images/leaf-r.png"
                    alt="Laurel right"
                    width={28}
                    height={52}
                    className="w-auto h-8 md:h-12 opacity-80 shrink-0"
                />
            </motion.div>

            {/* Main Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-[40px] leading-[1.1] sm:text-5xl md:text-[76px] font-semibold text-[#111] tracking-tight text-center max-w-5xl px-2"
            >
                <span className="whitespace-nowrap">
                    Effortless{' '}
                    <motion.span
                        animate={{ y: [4, -8, 4] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        className="inline-flex relative -top-1 md:-top-2 border-2 md:border-[3px] border-white rotate-6 items-center justify-center bg-indigo-50 w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl mx-1 shadow-inner text-[22px] md:text-3xl shadow-md"
                    >
                        👨‍💻
                    </motion.span>
                </span>{' '}
                <span className="whitespace-nowrap">Portfolios</span> <br className="hidden md:block" />
                <span className="whitespace-nowrap">
                    for{' '}
                    <motion.span
                        animate={{ y: [4, -10, 4] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                        className="inline-flex relative -top-1 md:-top-2 border-2 md:border-[3px] border-white -rotate-6 items-center justify-center bg-rose-50 w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl mx-1 shadow-inner text-[22px] md:text-3xl shadow-md"
                    >
                        💻
                    </motion.span>
                </span>{' '}
                <span className="whitespace-nowrap">
                    Developers{' '}
                    <motion.span
                        animate={{ y: [4, -6, 4] }}
                        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
                        className="inline-flex relative -top-1 md:-top-2 border-2 md:border-[3px] border-white -rotate-12 items-center justify-center bg-amber-50 w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl mx-1 shadow-inner text-[22px] md:text-3xl shadow-md"
                    >
                        📁
                    </motion.span>
                </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg md:text-xl text-gray-500 mt-8 max-w-2xl text-center px-4"
            >
                Automatic portfolio generation powered by your GitHub profile. <br className="hidden md:block" />
                Zero maintenance required. Setup once, let it narrate your story.
            </motion.p>

            {/* Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 mt-10"
            >
                <button
                    onClick={() => setShowGithubModal(true)}
                    className="bg-black text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg"
                >
                    <Github className="w-5 h-5" /> Generate Portfolio
                </button>
                <button className="bg-white border text-gray-700 border-gray-200 px-8 py-3.5 rounded-full text-base font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    <GitFork className="w-4 h-4 text-black" /> Contribute
                </button>
            </motion.div>
            {/* Metrics Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-20 w-full max-w-4xl border-t border-gray-100 pt-12"
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="flex flex-col items-center justify-center pt-4 md:pt-0">
                        <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#111] mb-2 flex items-center">
                            <Counter from={0} to={6010} duration={2} />+
                        </span>
                        <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest text-center">
                            Profiles Generated
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#111] mb-2 flex items-baseline">
                            <Counter from={0} to={8} duration={2} />
                            <span className="text-3xl font-semibold text-gray-300 ml-1">mo</span>
                        </span>
                        <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest text-center">
                            Continuously Active
                        </span>
                    </div>
                    <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
                        <span className="text-4xl md:text-5xl font-bold tracking-tight text-[#111] mb-2">
                            Global
                        </span>
                        <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-widest text-center">
                            Developer Reach
                        </span>
                    </div>
                </div>
            </motion.div>

            {showGithubModal && <GitHubModal onClose={() => setShowGithubModal(false)} />}
        </section>
    );
}
