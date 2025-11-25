import {
  LinkedInProfile,
  MediumBlog,
  Profile,
  UserProject,
} from "@/types/types";
import { supabase } from "./supabase";

// Utility function to detect provider from URL
const detectProvider = (url: string): string => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('medium.com')) return 'medium';
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('huggingface.co')) return 'huggingface';
  return 'generic';
};

/**
 * Get user profile data using Supabase Edge Function
 */
export const getUserProfile = async (
  username: string,
): Promise<Profile | null> => {
  if (!username) return null;

  try {
    const { data, error } = await supabase.functions.invoke(`fetch-profile?username=${username.toLowerCase()}`);

    if (error) {
      console.error(`Error fetching profile for ${username}:`, error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error(`Error fetching profile for ${username}:`, error);
    return null;
  }
};

/**
 * Get user projects data using Supabase Edge Function
 */
export const getUserProjects = async (
  username: string,
): Promise<UserProject | null> => {
  if (!username) return null;

  try {
    const { data, error } = await supabase.functions.invoke(`fetch-projects?username=${username.toLowerCase()}`);

    if (error) {
      console.error(`Error fetching projects for ${username}:`, error);
      return null;
    }

    return data as UserProject;
  } catch (error) {
    console.error(`Error fetching projects for ${username}:`, error);
    return null;
  }
};

/**
 * Get user LinkedIn profile data using Supabase Edge Function
 */
export const getUserLinkedInProfile = async (
  username: string,
): Promise<LinkedInProfile | null> => {
  try {
    if (!username) return null;

    const { data, error } = await supabase.functions.invoke(`fetch-linkedin?username=${username.toLowerCase()}`);

    if (error) {
      console.error(`Error fetching LinkedIn data for ${username}:`, error);
      return null;
    }

    // Validate the returned data structure
    if (!data || !data.basic_info) {
      console.warn(`Invalid LinkedIn data structure for user: ${username}`);
      return null;
    }

    return data as LinkedInProfile;
  } catch (error) {
    console.error(`Error fetching LinkedIn data for ${username}:`, error);
    return null;
  }
};

/**
 * Get user Medium blogs
 */
export const getUserMediumBlogs = async (
  username: string,
): Promise<MediumBlog[] | null> => {
  if (!username) return null;

  try {
    // Use RSS2JSON API to bypass Medium's 403 blocking
    const mediumRssUrl = `https://medium.com/feed/@${username}`;
    const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(mediumRssUrl)}`;

    const response = await fetch(rss2jsonUrl, {
      next: {
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Check if we have items in the feed
    if (!data.items || data.items.length === 0) {
      console.log("No items found in the RSS feed");
      return [];
    }

    // Format the blog posts
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.items.map((item: any) => {
      // Try to extract thumbnail image from content
      let thumbnail = "";

      // First try to get image from thumbnail field
      if (item.thumbnail) {
        thumbnail = item.thumbnail;
      }
      // If no thumbnail, try to extract from content
      else if (item.content) {
        const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) {
          thumbnail = imgMatch[1];
        }
      }
      // Try description as fallback
      else if (item.description) {
        const descImgMatch = item.description.match(/<img[^>]+src="([^">]+)"/);
        if (descImgMatch && descImgMatch[1]) {
          thumbnail = descImgMatch[1];
        }
      }

      return {
        title: item.title || "No title",
        link: item.link || item.guid || "",
        pubDate: item.pubDate || "",
        // Remove HTML tags from content
        preview: item.description
          ? item.description.replace(/<[^>]*>/g, "").substring(0, 200)
          : "No preview available",
        // Get categories if available
        categories: item.categories
          ? Array.isArray(item.categories)
            ? item.categories.join(", ")
            : item.categories
          : "",
        thumbnail: thumbnail,
      };
    });
  } catch (error) {
    console.error(`Error fetching Medium blogs: ${error}`);
    return null;
  }
};

// Deprecated functions removed - use getUserProfile, getUserProjects, getUserLinkedInProfile instead

/**
 * API to add user to Supabase via edge function for analytics
 */
export const addUserToSupabase = async (user: Profile | null, searchParams?: URLSearchParams) => {
  if (!user) return;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase configuration missing");
    return;
  }

  const url = `${supabaseUrl}/functions/v1/devb-io`;

  // Map user data to match Supabase function whitelist
  const mappedData: Record<string, string> = {
    name: user.username,
    "full name": user.name,
    "devb profile": `https://devb.io/${user.username}`,
    github: `https://github.com/${user.username}`,
  };

  // Add query parameters if available
  if (searchParams) {
    // UTM parameters
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');
    const utmTerm = searchParams.get('utm_term');
    const utmContent = searchParams.get('utm_content');

    // Referral parameter
    const ref = searchParams.get('ref');

    // Add to mapped data if they exist
    if (utmSource) mappedData['utm_source'] = utmSource;
    if (utmMedium) mappedData['utm_medium'] = utmMedium;
    if (utmCampaign) mappedData['utm_campaign'] = utmCampaign;
    if (utmTerm) mappedData['utm_term'] = utmTerm;
    if (utmContent) mappedData['utm_content'] = utmContent;
    if (ref) mappedData['ref'] = ref;
  }

  // Counter for generic URLs
  let genericCounter = 1;

  // Add social accounts based on provider
  user.social_accounts?.forEach((account) => {
    const provider = account.provider.toLowerCase();

    // If provider is generic, detect the actual platform
    const actualProvider = provider === "generic" ? detectProvider(account.url) : provider;

    switch (actualProvider) {
      case "linkedin":
        mappedData["Linkedin"] = account.url;
        break;
      case "twitter":
        mappedData["twitter"] = account.url;
        break;
      case "medium":
        mappedData["Medium"] = account.url;
        break;
      case "instagram":
        mappedData["instagram"] = account.url;
        break;
      case "huggingface":
        // Could add huggingface to whitelist if needed
        break;
      case "generic":
        // Check if it's a devb.io link
        if (account.url.includes("devb.io")) {
          mappedData["devb"] = account.url;
        } else {
          // For other generic URLs, number them
          mappedData[`generic ${genericCounter}`] = account.url;
          genericCounter++;
        }
        break;
    }
  });

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${supabaseAnonKey}`,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(mappedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("User data sent to Supabase:", result);
  } catch (error) {
    console.error("Error sending data to Supabase:", error);
  }
};
