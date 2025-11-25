'use client';

import React from 'react';
import { MediumBlog } from '@/types/types';

interface BlogCardProps {
    blog: MediumBlog;
}

export default function BlogCard({ blog }: BlogCardProps) {
    return (
        <article
            style={{
                border: '1px solid var(--gray-200)',
                padding: '1.5rem',
                transition: 'all 0.2s',
                cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--black)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.75rem',
                gap: '1rem',
                flexWrap: 'wrap'
            }}>
                <time style={{
                    fontSize: '0.8125rem',
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {new Date(blog.pubDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </time>
                <span style={{
                    fontSize: '0.8125rem',
                    color: 'var(--gray-500)'
                }}>
                    {Math.ceil(blog.preview.length / 1000)} min read
                </span>
            </div>

            <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                lineHeight: 1.3
            }}>
                <a
                    href={blog.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resume-link"
                    style={{ textDecoration: 'none' }}
                >
                    {blog.title}
                </a>
            </h3>

            <p style={{
                fontSize: '0.9375rem',
                color: 'var(--gray-600)',
                lineHeight: 1.6,
                marginBottom: '1rem'
            }}>
                {blog.preview.substring(0, 200)}...
            </p>

            {blog.categories && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {blog.categories.split(',').slice(0, 3).map((cat, i) => (
                        <span
                            key={i}
                            style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.75rem',
                                background: 'var(--gray-100)',
                                color: 'var(--gray-700)',
                                border: '1px solid var(--gray-200)',
                            }}
                        >
                            {cat.trim()}
                        </span>
                    ))}
                </div>
            )}
        </article>
    );
}
