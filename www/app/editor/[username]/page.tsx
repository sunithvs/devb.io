import { getCompleteProfileData, getLinkedInUsername, getMediumUsername } from '@/lib/data-adapter';
import { getUserLinkedInProfile, getUserMediumBlogs } from '@/lib/api';
import EditorClient from '@/components/editor/EditorClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface EditorPageProps {
    params: Promise<{
        username: string;
    }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
    const { username } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If logged in, check if the user is the owner
    if (user) {
        const { data: userData } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();

        if (userData && userData.username !== username) {
            // Redirect to their own editor if they try to access someone else's
            redirect(`/editor/${userData.username}`);
        }
    } else {
        // Optional: Redirect to login if not logged in? 
        // For now, we might allow viewing in read-only, but the requirement was to restrict editing.
        // The EditorClient handles the "not logged in" state by showing AuthModal on publish.
        // But to be safe, maybe we just let them view but they can't save (which is handled by saveProfile check).
        // However, the prompt says "restrict this thing from happening", implying the access itself or the ability to trigger the save.
        // The saveProfile check is the hard stop. The redirect is a UX improvement.
    }

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
