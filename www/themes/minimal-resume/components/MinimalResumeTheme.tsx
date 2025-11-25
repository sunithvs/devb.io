import React from 'react';
import { ThemePageProps } from '@/types/theme';
import Image from 'next/image';
import BlogCard from './BlogCard';
import { ProfileData } from '@/types/types';
import '../styles/theme.css';

interface MinimalResumeThemeProps {
    data: ProfileData;
    username: string;
}

/**
 * Minimal Resume Theme - Pure Component
 * Renders the UI based on passed data props
 */
export default function MinimalResumeTheme({
    data,
    username
}: MinimalResumeThemeProps) {
    const { profile, projects, linkedin, blogs } = data;

    return (
        <div className="minimal-resume-theme">
            <div className="resume-container">
                {/* Header */}
                <header className="resume-header">
                    {/* Profile Photo */}
                    {profile.avatar_url && (
                        <div style={{
                            width: '120px',
                            height: '120px',
                            margin: '0 auto 1.5rem',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid var(--black)',
                        }}>
                            <Image
                                src={profile.avatar_url}
                                alt={profile.name || username}
                                width={120}
                                height={120}
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <h1 className="resume-name">{profile.name || username}</h1>
                    <p className="resume-title">{profile.bio || linkedin?.basic_info.headline || 'Software Engineer'}</p>
                    <div className="resume-contact">
                        {profile.location && <span>📍 {profile.location}</span>}
                        <a href={`https://github.com/${username}`} target="_blank" rel="noopener noreferrer">
                            GitHub
                        </a>
                        {linkedin && (
                            <a href={linkedin.basic_info.profile_url} target="_blank" rel="noopener noreferrer">
                                LinkedIn
                            </a>
                        )}
                    </div>
                </header>

                {/* About */}
                {profile.about && (
                    <section className="resume-section">
                        <h2 className="resume-section-title">About</h2>
                        <p className="resume-about">{profile.about}</p>
                    </section>
                )}

                {/* Stats */}
                <div className="resume-stats">
                    <div className="resume-stat">
                        <span className="resume-stat-value">{profile.public_repos || 0}</span>
                        <span className="resume-stat-label">Repositories</span>
                    </div>
                    <div className="resume-stat">
                        <span className="resume-stat-value">{profile.followers || 0}</span>
                        <span className="resume-stat-label">Followers</span>
                    </div>
                    <div className="resume-stat">
                        <span className="resume-stat-value">
                            {profile.achievements?.total_contributions || 0}
                        </span>
                        <span className="resume-stat-label">Contributions</span>
                    </div>
                    {projects && projects.top_projects && (
                        <div className="resume-stat">
                            <span className="resume-stat-value">
                                {projects.top_projects.reduce((sum, p) => sum + p.stars, 0)}
                            </span>
                            <span className="resume-stat-label">Total Stars</span>
                        </div>
                    )}
                </div>

                {/* Experience */}
                {linkedin && linkedin.experience && linkedin.experience.length > 0 && (
                    <section className="resume-section">
                        <h2 className="resume-section-title">Experience</h2>
                        <div className="resume-experience-list">
                            {linkedin.experience.map((exp, index) => (
                                <div key={index} className="resume-experience-item">
                                    <div className="resume-experience-date">
                                        {exp.duration.start.month && exp.duration.start.year ? (
                                            <>
                                                {new Date(exp.duration.start.year, exp.duration.start.month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                {' — '}
                                                {exp.duration.end ?
                                                    new Date(exp.duration.end.year!, exp.duration.end.month! - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                                    : 'Present'}
                                            </>
                                        ) : (
                                            // Fallback if full date is missing
                                            <>
                                                {exp.duration.start.year} — {exp.duration.end?.year || 'Present'}
                                            </>
                                        )}
                                    </div>
                                    <div className="resume-experience-content">
                                        <h3 className="resume-experience-title">{exp.title}</h3>
                                        <div className="resume-experience-company">{exp.company}</div>
                                        {exp.description && (
                                            <p className="resume-experience-description">{exp.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects && projects.top_projects && projects.top_projects.length > 0 && (
                    <section className="resume-section">
                        <h2 className="resume-section-title">Featured Projects</h2>
                        <div className="resume-projects-grid">
                            {projects.top_projects.slice(0, 6).map((project, index) => (
                                <div key={index} className="resume-project">
                                    <h3 className="resume-project-name">
                                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="resume-link">
                                            {project.name}
                                        </a>
                                    </h3>
                                    <p className="resume-project-description">
                                        {project.description || 'No description available'}
                                    </p>
                                    <div className="resume-project-meta">
                                        <span>⭐ {project.stars}</span>
                                        <span>🔱 {project.forks}</span>
                                    </div>
                                    {project.languages && project.languages.length > 0 && (
                                        <div className="resume-project-tags">
                                            {project.languages.slice(0, 3).map((lang, i) => (
                                                <span key={i} className="resume-tag">{lang}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Education */}
                {linkedin && linkedin.education && linkedin.education.length > 0 && (
                    <section className="resume-section">
                        <h2 className="resume-section-title">Education</h2>
                        {linkedin.education.map((edu, index) => (
                            <div key={index} className="resume-item">
                                <div className="resume-item-header">
                                    <div>
                                        <div className="resume-item-title">
                                            {edu.degree} {edu.field && `in ${edu.field}`}
                                        </div>
                                        <div className="resume-item-company">{edu.school}</div>
                                    </div>
                                    <div className="resume-item-date">
                                        {edu.duration.start.year} - {edu.duration.end?.year || 'Present'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {projects && projects.top_languages && projects.top_languages.length > 0 && (
                    <section className="resume-section">
                        <h2 className="resume-section-title">Technical Skills</h2>
                        <div className="resume-skills">
                            {projects.top_languages.slice(0, 8).map(([lang, _], index) => (
                                <span key={index} className="resume-skill">{lang}</span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Blog Posts */}
                {blogs && blogs.length > 0 && (
                    <section className="resume-section">
                        <h2 className="resume-section-title">Recent Writing</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {blogs.slice(0, 4).map((blog, index) => (
                                <BlogCard key={index} blog={blog} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer style={{
                    marginTop: '4rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid var(--gray-200)',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--gray-500)'
                }}>
                    <p>
                        Generated with <a href="https://devb.io" className="resume-link">devb.io</a>
                    </p>
                </footer>
            </div>
        </div>
    );
}
