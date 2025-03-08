import {
  LinkedInProfile,
  MediumBlog,
  Profile,
  UserProject,
} from "@/types/types";
import { parseStringPromise } from "xml2js";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_X_API_KEY;

/**
 * Fetch resource with Next.js caching
 */
const fetchResource = async <T>(
  endpoint: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any = {},
): Promise<T | null> => {
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
        ...options.next,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching ${endpoint}: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // @ts-expect-error -- asflasdlkfjasdlf
    if (error?.name === "AbortError") {
      console.error(`Request timeout for ${endpoint}`);
    } else {
      console.error(`Error fetching ${endpoint}:`, error);
    }
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
 * Get user LinkedIn profile data with retry mechanism
 */
export const getUserLinkedInProfile = async (
  username: string,
  maxRetries = 3,
  retryDelay = 1000,
): Promise<LinkedInProfile | null> => {
  if (!username) return null;

  let retries = 0;
  let lastError: unknown = null;

  // Implement retry logic
  while (retries < maxRetries) {
    try {
      // Add a cache tag for better revalidation
      const data = await fetchResource<LinkedInProfile>(
        `/user/${username}/linkedin`,
        {
          next: {
            revalidate: 3600, // 1 hour
            tags: [`linkedin-${username}`],
          },
        },
      );

      // Validate the returned data structure
      if (!data || !data.basic_info) {
        console.warn(`Invalid LinkedIn data structure for user: ${username}`);
        return null;
      }

      return data;
    } catch (error) {
      lastError = error;
      retries++;

      // Log retry attempt
      console.warn(
        `LinkedIn API call failed (attempt ${retries}/${maxRetries}):`,
        error,
      );

      // If we've reached max retries, break out of the loop
      if (retries >= maxRetries) break;

      // Implement exponential backoff
      const backoffDelay = retryDelay * Math.pow(2, retries - 1);
      console.log(`Retrying in ${backoffDelay}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }

  // If we've exhausted all retries, log the final error and return null
  console.error(
    `Error fetching LinkedIn data for ${username} after ${maxRetries} attempts:`,
    lastError,
  );
  return null;
};

/**
 * Get user Medium blogs
 */
export const getUserMediumBlogs = async (
  username: string,
): Promise<MediumBlog[] | null> => {
  if (!username) return null;

  try {
    // Build the URL for the user's Medium RSS feed
    const url = `https://medium.com/feed/@${username}`;

    const response = await fetch(url, {
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const xmlData = await response.text();

    // Parse the XML response
    const parser = { explicitArray: false };
    const result = await parseStringPromise(xmlData, parser);

    // Check if we have items in the feed
    if (!result.rss || !result.rss.channel || !result.rss.channel.item) {
      console.log("No items found in the RSS feed");
      return [];
    }

    // Get all items (make sure it's an array even if there's only one item)
    const items = Array.isArray(result.rss.channel.item)
      ? result.rss.channel.item
      : [result.rss.channel.item];

    // Format the blog posts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return items.map((item: any) => {
      // Try to extract thumbnail image from content
      let thumbnail = "";

      // First try to get image from content:encoded
      if (item["content:encoded"]) {
        // Look for the first image tag with src attribute
        const imgMatch = item["content:encoded"].match(
          /<img[^>]+src="([^">]+)"/,
        );
        if (imgMatch && imgMatch[1]) {
          thumbnail = imgMatch[1];
        }
      }

      // If no image found in content, try to get from media:content
      if (!thumbnail && item["media:content"] && item["media:content"].$.url) {
        thumbnail = item["media:content"].$.url;
      }

      // If still no image, check for enclosure
      if (!thumbnail && item.enclosure && item.enclosure.$.url) {
        thumbnail = item.enclosure.$.url;
      }

      // If still no image, try to find an image URL in the description
      if (!thumbnail && item.description) {
        const descImgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (descImgMatch && descImgMatch[1]) {
          thumbnail = descImgMatch[1];
        }
      }

      return {
        title: item.title || "No title",
        link: item.link || "",
        pubDate: item.pubDate || "",
        // Remove HTML tags from content
        preview: item["content:encoded"]
          ? item["content:encoded"].replace(/<[^>]*>/g, "")
          : "No preview available",
        // Get categories if available
        categories: item.category
          ? Array.isArray(item.category)
            ? item.category.join(", ")
            : item.category
          : "",
        thumbnail: thumbnail,
      };
    });
  } catch (error) {
    console.error(`Error fetching Medium blogs: ${error}`);
    return null;
  }
};

/**
 * Get user profile data (server-side)
 */
export const getProfileData = async (
  username: string,
): Promise<Profile | null> => {
  if (!username) return null;
  return fetchResource<Profile>(`/user/${username}/profile`);
};

/**
 * Get user projects data (server-side)
 */
export const getProjectData = async (
  username: string,
): Promise<UserProject | null> => {
  if (!username) return null;
  return fetchResource<UserProject>(`/user/${username}/projects`);
};

/**
 * Get user LinkedIn profile data (server-side)
 */
export const getLinkedInProfileData = async (
  username: string,
): Promise<LinkedInProfile | null> => {
  if (!username) return null;
  return fetchResource<LinkedInProfile>(`/user/${username}/linkedin`);
};
