import { getCompleteProfileData, getLinkedInUsername, getMediumUsername } from '@/lib/data-adapter';
import { getUserLinkedInProfile, getUserMediumBlogs } from '@/lib/api';
import EditorClient from '@/components/editor/EditorClient';

interface EditorPageProps {
    params: {
        username: string;
    };
}

export default async function EditorPage({ params }: EditorPageProps) {
    const { username } = params;

    const baseProfileData = await getCompleteProfileData(username);

    if (!baseProfileData) {
        return <div>Profile not found</div>;
    }

    const linkedInUsername = getLinkedInUsername(baseProfileData.profile);
    const mediumUsername = getMediumUsername(baseProfileData.profile);

    const [linkedin, blogs] = await Promise.all([
        linkedInUsername ? getUserLinkedInProfile(linkedInUsername) : Promise.resolve(null),
        mediumUsername ? getUserMediumBlogs(mediumUsername) : Promise.resolve(null)
    ]);

    const profileData = {
        ...baseProfileData,
        linkedin,
        blogs
    };

    return (
        <EditorClient
            initialData={profileData}
            username={username}
        />
    );
}
