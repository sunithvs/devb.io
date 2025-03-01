import { useQuery } from "@tanstack/react-query";
import {
  getUserLinkedInProfile,
  getUserProfile,
  getUserProjects,
} from "@/lib/api";

export function useGetUserProfile(username: string,) {
  return useQuery({
    queryKey: ["user-profile", username],
    queryFn: async () => getUserProfile(username),
  });
}

export function useGetUserProject(username: string) {
  return useQuery({
    queryKey: ["user-projects", username],
    queryFn: async () => getUserProjects(username),
  });
}

export function useGetUserLinkedInProfile(username: string) {
  return useQuery({
    queryKey: ["user-linkedin-profile", username],
    queryFn: async () => getUserLinkedInProfile(username),
    enabled: !!username,
  });
}
