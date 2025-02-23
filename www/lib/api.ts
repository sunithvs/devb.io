import axios from "axios";
import { LinkedInProfile, Profile, UserProject } from "@/types/types";

const BASE_URL = "https://v2.devb.io";

export const getUserProfile = async (
  username: string,
): Promise<Profile | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/user/${username}/profile`, {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": "1245678765435",
      },
    });
    return res.data as Profile;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

export const getUserProjects = async (
  username: string,
): Promise<UserProject | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/user/${username}/projects`, {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": "1245678765435",
      },
    });
    return res.data as UserProject;
  } catch (error) {
    console.error("Error fetching projects:", error);
    return null;
  }
};

export const getUserLinkedInProfile = async (
  username: string,
): Promise<LinkedInProfile | null> => {
  try {
    const res = await axios.get(`${BASE_URL}/user/${username}/linkedin`, {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Api-Key": "1245678765435",
      },
    });
    return res.data as LinkedInProfile;
  } catch (error) {
    console.error("Error fetching linkedin profile:", error);
    return null;
  }
};
