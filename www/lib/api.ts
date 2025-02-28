import axios from "axios";
import { LinkedInProfile, Profile, UserProject } from "@/types/types";

const BASE_URL = process.env.API_BASE_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Api-Key": process.env.X_API_KEY,
  },
});

const fetchResource = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const res = await apiClient.get(endpoint);
    return res.data as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
};

export const getUserProfile = async (
  username: string,
): Promise<Profile | null> => {
  if (!username) return null;
  return fetchResource<Profile>(`/user/${username}/profile`);
};

export const getUserProjects = async (
  username: string,
): Promise<UserProject | null> => {
  if (!username) return null;
  return fetchResource<UserProject>(`/user/${username}/projects`);
};

export const getUserLinkedInProfile = async (
  username: string,
): Promise<LinkedInProfile | null> => {
  if (!username) return null;
  return fetchResource<LinkedInProfile>(`/user/${username}/linkedin`);
};
