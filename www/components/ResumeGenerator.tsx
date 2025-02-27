import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Image, pdf } from '@react-pdf/renderer';
import { useGetUserProfile, useGetUserProject, useGetUserLinkedInProfile } from '../hooks/user-hook';
import type { LinkedInProfile } from '../types/types';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 12,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    headerSection: {
        textAlign: 'center',
        marginBottom: 2,
        fontWeight: 'bold',
        fontSize: 14,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    icon: {
        width: 14,
        height: 14,
        marginHorizontal: 5,
    },
    headline: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    section: {
        marginBottom: 15,
    },
    subheader: {
        fontSize: 14,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 5,
    },
    itemTitle: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    text: {
        fontSize: 11,
        marginBottom: 3,
    },
    link: {
        fontSize: 10,
        color: '#333',
    },
    iconsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        fontSize: 9,
    },
    disclaimerText: {
        color: 'grey',
        fontSize: 7,
    },
});

interface ResumeData {
    name: string;
    bio: string;
    username: string;
    github_url: string;
    location: string;
    followers: number;
    following: number;
    public_repos: number;
    profile_summary: string;
    top_languages: [string, number][];
    top_projects: {
        name: string;
        description: string | null;
        score: number | null;
        stars: number;
        forks: number;
        language: string | null;
        url: string;
        updatedAt: string;
        isPinned: boolean;
        homepage: string | null;
    }[];
    achievements: {
        total_contributions: number;
        repositories_contributed_to: number;
        pull_requests_merged: number;
        issues_closed: number;
    };
    linkedin_profile: LinkedInProfile;
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getMonthString = (monthNumber: number): string => {
    if (monthNumber < 1 || monthNumber > 12) {
        throw new Error("Invalid month number");
    }
    return monthNames[monthNumber - 1];
};
const formatExperienceDuration = (start: { month?: number; year: number }, end?: { month?: number; year?: number } | null) => {
    const startMonth = start.month ? getMonthString(start.month) : '';
    const startYear = start.year;
    const endMonth = end?.month ? getMonthString(end.month) : '';
    const endYear = end?.year || 'Present';

    return `${startMonth}, ${startYear} - ${endMonth ? `${endMonth}, ` : ''}${endYear}`;
};

const ResumeDocument = ({ data }: { data: ResumeData }) => (
    <Document>
        <Page style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.headerSection}>{(data.linkedin_profile.basic_info.full_name || data.name).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Text>
                <View style={styles.iconsContainer}>
                    <Image style={styles.icon} src='https://img.icons8.com/ios-glyphs/480/github.png' />
                    <Link style={styles.link} src={`https://github.com/${data.username}`}>Github</Link>
                    <Image style={styles.icon} src='https://img.icons8.com/ios-filled/480/linkedin.png' />
                    <Link style={styles.link} src={data.linkedin_profile.basic_info.profile_url}>Linkedin</Link>
                </View>
                {/* <Text style={styles.text}><Image style={styles.icon} src='../public/images/gh.png'/> <Link src={data.github_url}>{ data.username} </Link> Linkedin: <Link src={data.linkedin_profile.basic_info.profile_url}> {data.linkedin_profile.basic_info.full_name}</Link></Text> */}
                <Text style={styles.text}>{data.linkedin_profile.basic_info.headline}</Text>
                {/* <Text style={styles.text}>Location: {data.location}</Text> */}
                {/* <Text style={styles.text}>Followers: {data.followers}</Text> */}
                {/* <Text style={styles.text}>Following: {data.following}</Text> */}
            </View>
            {data.profile_summary && (
                <View style={styles.section}>
                    <Text style={styles.subheader}>Summary</Text>
                    <Text style={styles.text}>{data.profile_summary}</Text>
                </View>)}
            {data.linkedin_profile.experience.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subheader}>Experience</Text>
                    {data.linkedin_profile.experience.slice(0, 3).map((experience, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={styles.itemTitle}>{experience.title} at {experience.company}</Text>
                            <Text style={styles.text}>{experience.location}</Text>
                            {experience.description && <Text style={styles.text}>{experience.description}</Text>}
                            <Text style={styles.text}>{formatExperienceDuration(experience.duration.start, experience.duration.end)}</Text>
                        </View>
                    ))}
                </View>)}
            {data.top_projects.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subheader}>Projects</Text>
                    {data.top_projects.slice(0, 3).map((project) => (
                        <View key={project.name} style={styles.section}>
                            <Text style={styles.itemTitle}>{project.name} | <Link style={styles.link} src={project.url}>Github</Link> {project.homepage && <>| <Link style={styles.link} src={project.homepage}>Link</Link></>}</Text>
                            {project.description && <Text style={styles.text}>{project.description}</Text>}
                            {/* <Text style={styles.text}>Updated: {new Date(project.updatedAt).toLocaleDateString()}</Text> */}
                        </View>
                    ))}
                </View>
            )}
            {data.linkedin_profile.education.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.subheader}>Education</Text>
                    {data.linkedin_profile.education.slice(0, 1).map((education, index) => (
                        <View key={index} style={styles.section}>
                            <Text style={[styles.text, { fontWeight: 'bold' }]}>{education.degree} in {education.field}</Text>
                            <Text style={styles.text}>{education.school}</Text>
                            <Text style={styles.text}>{education.duration.start.year} - {education.duration.end.year}</Text>
                        </View>
                    ))}
                </View>)}
            <View style={styles.section}>
                <Text style={styles.subheader}>Technical Skills</Text>
                <Text style={styles.text}>
                    Programming Languages: {Array.isArray(data.top_languages) ? data.top_languages.slice(0, 3).map(lang => lang[0]).join(", ") : "No languages available"}
                </Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.subheader}>Achievements</Text>
                {data.achievements.total_contributions > 1 && (
                    <Text style={styles.text}>Total Contributions: {data.achievements.total_contributions}</Text>
                )}
                {data.achievements.issues_closed > 1 && (
                    <Text style={styles.text}>Issues Closed: {data.achievements.issues_closed}</Text>
                )}
                {data.public_repos > 1 && (
                    <Text style={styles.text}>Public Repositories: {data.public_repos}</Text>
                )}
                {data.achievements.repositories_contributed_to > 1 && (
                    <Text style={styles.text}>Repositories Contributed To: {data.achievements.repositories_contributed_to}</Text>
                )}
                {data.achievements.pull_requests_merged > 1 && (
                    <Text style={styles.text}>Pull Requests Merged: {data.achievements.pull_requests_merged}</Text>
                )}
            </View>
            <View style={styles.section}>
                <Text style={styles.disclaimerText}>*Autogenerated via <Link style={[styles.link, {fontSize:7}]} src='https://devb.io'>devb.io</Link></Text>
            </View>
        </Page>
    </Document>
);

const ResumeGenerator: React.FC<{ username: string }> = ({ username }) => {

    const { data: userProfile, isLoading: isLoadingProfile, error: errorProfile } = useGetUserProfile(username);
    const { data: userProjects, isLoading: isLoadingProjects, error: errorProjects } = useGetUserProject(username);
    const { data: userLinkedInProfile, isLoading: isLoadingLinkedIn, error: errorLinkedIn } = useGetUserLinkedInProfile(username);

    console.log(userProfile, userProjects, userLinkedInProfile);

    if (isLoadingProfile || isLoadingProjects || isLoadingLinkedIn) return <div>Loading...</div>;
    if (errorProfile || errorProjects || errorLinkedIn) return <div>Error loading data</div>;

    const defaultLinkedInProfile: LinkedInProfile = {
        experience: [],
        education: [],
        basic_info: {
            full_name: '',
            headline: '',
            location: {
                city: '',
                state: '',
                country: ''
            },
            summary: '',
            profile_url: '',
            connections: 0
        }
    };

    const combinedData: ResumeData = {
        name: userProfile?.name || '',
        bio: userProfile?.bio || '',
        username: userProfile?.username || '',
        github_url: userProfile?.profile_url || '',
        location: userProfile?.location || '',
        followers: userProfile?.followers || 0,
        following: userProfile?.following || 0,
        public_repos: userProfile?.public_repos || 0,
        profile_summary: userProfile?.about || '',
        top_languages: userProjects?.top_languages || [],
        top_projects: userProjects?.top_projects || [],
        linkedin_profile: userLinkedInProfile || defaultLinkedInProfile,
        achievements: {
            total_contributions: userProfile?.achievements.total_contributions || 0,
            repositories_contributed_to: userProfile?.achievements.repositories_contributed_to || 0,
            pull_requests_merged: userProfile?.pull_requests_merged || 0,
            issues_closed: userProfile?.issues_closed || 0,
        },
    };
    const handleOpenInNewTab = async () => {
        const pdfInstance = pdf(<ResumeDocument data={combinedData} />);
        const blob = await pdfInstance.toBlob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <button onClick={handleOpenInNewTab} style={{ cursor: 'pointer', padding: '10px', fontSize: '16px' }}>
            Download Resume
        </button>
    );
};


export default ResumeGenerator;
