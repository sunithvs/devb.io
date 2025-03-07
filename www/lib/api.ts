import { LinkedInProfile, Profile, UserProject } from "@/types/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;

/**
 * Fetch resource with Next.js caching
 */
const fetchResource = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": API_KEY || "",
      },
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching ${endpoint}: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
};

/**
 * Get user profile data
 */
export const getUserProfile = async (
  username: string,
): Promise<Profile | null> => {
  if (!username) return null;
  return fetchResource<Profile>(`/user/${username}/profile`);
};

/**
 * Get user projects data
 */
export const getUserProjects = async (
  username: string,
): Promise<UserProject | null> => {
  if (!username) return null;
  return fetchResource<UserProject>(`/user/${username}/projects`);
};

/**
 * Get user LinkedIn profile data
 */
export const getUserLinkedInProfile = async (
  username: string,
): Promise<LinkedInProfile | null> => {
  if (!username) return null;
  return fetchResource<LinkedInProfile>(`/user/${username}/linkedin`);
};
