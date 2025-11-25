import {
  LinkedInProfile,
  MediumBlog,
  Profile,
  UserProject,
} from "@/types/types";
import { supabase } from "./supabase";

// Social Platform Configuration
export const SOCIAL_PLATFORMS: Record<string, {
  name: string;
  urlPattern: RegExp;
  autoFetch: boolean;
  usernameGroup: number; // The regex group index for the username
}> = {
  linkedin: {
    name: 'LinkedIn',
    urlPattern: /linkedin\.com\/in\/([^/?&]+)/i,
    autoFetch: true,
    usernameGroup: 1,
  },
  medium: {
    name: 'Medium',
    urlPattern: /medium\.com\/@?([^/?&]+)/i,
    autoFetch: true,
    usernameGroup: 1,
  },
  twitter: {
    name: 'Twitter',
    urlPattern: /(?:twitter\.com|x\.com)\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  github: {
    name: 'GitHub',
    urlPattern: /github\.com\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  instagram: {
    name: 'Instagram',
    urlPattern: /instagram\.com\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  youtube: {
    name: 'YouTube',
    urlPattern: /(?:youtube\.com\/@|youtube\.com\/channel\/|youtube\.com\/user\/)([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  stackoverflow: {
    name: 'Stack Overflow',
    urlPattern: /stackoverflow\.com\/users\/(?:\d+\/)?([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  gitlab: {
    name: 'GitLab',
    urlPattern: /gitlab\.com\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  devto: {
    name: 'Dev.to',
    urlPattern: /dev\.to\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  twitch: {
    name: 'Twitch',
    urlPattern: /twitch\.tv\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  dribbble: {
    name: 'Dribbble',
    urlPattern: /dribbble\.com\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  behance: {
    name: 'Behance',
    urlPattern: /behance\.net\/([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
  producthunt: {
    name: 'Product Hunt',
    urlPattern: /producthunt\.com\/@([^/?&]+)/i,
    autoFetch: false,
    usernameGroup: 1,
  },
};

// Utility function to detect provider from URL
export const detectProvider = (url: string): string => {
  const urlLower = url.toLowerCase();
  for (const [provider, config] of Object.entries(SOCIAL_PLATFORMS)) {
    if (config.urlPattern.test(urlLower)) {
      return provider;
    }
  }
  return 'custom';
};

export const extractUsername = (url: string, provider: string): string | null => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    // Use the full URL string for regex matching to handle paths correctly
    const fullUrl = urlObj.toString();

    const config = SOCIAL_PLATFORMS[provider];
    if (config) {
      const match = fullUrl.match(config.urlPattern);
      if (match && match[config.usernameGroup]) {
        return match[config.usernameGroup];
      }
    }

    // Fallback for generic/custom if needed, or return null
    return null;
  } catch (e) {
    // If URL parsing fails, try matching the raw string
    const config = SOCIAL_PLATFORMS[provider];
    if (config) {
      const match = url.match(config.urlPattern);
      if (match && match[config.usernameGroup]) {
        return match[config.usernameGroup];
      }
    }
    console.error('Error parsing URL:', e);
  }
  return null;
};

export const isValidSocialUrl = (provider: string, url: string): boolean => {
  if (provider === 'custom') return true; // Accept any URL for custom
  const config = SOCIAL_PLATFORMS[provider];
  if (!config) return true; // Unknown provider, be lenient
  return config.urlPattern.test(url);
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
