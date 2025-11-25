import { getCompleteProfileData, getLinkedInUsername, getMediumUsername } from '@/lib/data-adapter';
import { getUserLinkedInProfile, getUserMediumBlogs } from '@/lib/api';
import EditorClient from '@/components/editor/EditorClient';

export default async function EditorPage() {
    // Mock user for now - in real app this comes from auth session
    const username = 'sunithvs';

    const baseProfileData = await getCompleteProfileData(username);

    if (!baseProfileData) {
        return <div>Error loading profile data</div>;
    }

    // Fetch slow data for the editor (we wait for it here since editor doesn't stream yet)
    // In the future we could implement streaming in the editor too
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
