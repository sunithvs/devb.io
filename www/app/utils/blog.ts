export interface BlogPost {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  categories: string[];
}

export interface Root {
  status: string;
  feed: {
    url: string;
    title: string;
    link: string;
    author: string;
    description: string;
    image: string;
  };
  items: BlogPost[];
}

export async function getMediumBlogPosts(username: string): Promise<BlogPost[] | null> {
  try {
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40${username}`,
      { next: { revalidate: 3600 } }
    );
    
    if (!res.ok) {
      throw new Error("Failed to fetch blog posts");
    }

    const data: Root = await res.json();
    const imgRegex = /<img[^>]+src="([^">]+)"/i;

    // Update thumbnail for posts without it
    data.items = data.items.map((post) => {
      if (!post.thumbnail) {
        const match = imgRegex.exec(post.description);
        if (match && match[1]) {
          post.thumbnail = match[1];
        }
      }
      return post;
    });

    return data.items;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return null;
  }
}

export function extractMediumUsername(url: string): string | null {
  const regex = /@([^/?]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
