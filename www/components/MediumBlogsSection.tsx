import { ArrowDown, ExternalLink } from "lucide-react";
import { getUserMediumBlogs, getUserProfile } from "@/lib/api";
import Badge from "./Badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import React from "react";
import { MediumBlog } from "@/types/types";

export async function MediumBlogsSection({ username }: { username: string }) {
  const user = await getUserProfile(username);
  if (!user) return null;

  // Find the Medium account in social accounts
  const mediumAccount = user?.social_accounts?.find(
    (account) =>
      account.provider === "generic" && account.url.includes("medium.com"),
  );

  if (!mediumAccount) return null;

  // Extract username from URL (format: https://medium.com/@username)
  const mediumUsername = mediumAccount.url.split("@")[1];
  if (!mediumUsername) return null;

  const blogs = await getUserMediumBlogs(mediumUsername);

  if (!blogs || blogs.length === 0) return null;

  return (
    <>
      <div className="text-2xl font-bold mb-4 animate-fade-in">
        <h2>
          Latest Articles <ArrowDown strokeWidth={2} className="inline" />
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blogs.map((blog, index) => (
          <BlogCard key={blog.link} blog={blog} index={index} />
        ))}
      </div>
    </>
  );
}

const BlogCard = ({ blog, index }: { blog: MediumBlog; index: number }) => {
  // Format publication date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Default image if no thumbnail is found
  const defaultImage =
    "https://miro.medium.com/v2/resize:fit:1400/format:webp/1*psYl0y9DUzZWtHzFJLIvTw.png";

  // Parse categories
  const categoryList = blog.categories
    ? blog.categories.split(",").map((cat) => cat.trim())
    : [];

  return (
    <div className="bg-white rounded-xl border-1 border-black border-b-4 flex flex-col h-full transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg will-change-transform overflow-hidden">
      <div className="relative w-full h-40">
        <img
          src={blog.thumbnail || defaultImage}
          alt={blog.title}
          className="w-full h-full object-cover animate-fade-in will-change-opacity"
          style={{ animationDuration: "0.7s" }}
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3
          className="font-bold text-lg mb-2 animate-slide-up will-change-transform"
          style={{
            animationDuration: "0.7s",
            animationDelay: `${0.2 + 0.1 * index}s`,
          }}
        >
          {blog.title}
        </h3>

        <p
          className="text-gray-600 text-sm mb-4 flex-1 animate-slide-up will-change-transform line-clamp-2"
          style={{
            animationDuration: "0.7s",
            animationDelay: `${0.3 + 0.1 * index}s`,
          }}
        >
          {blog.preview}
        </p>

        <div
          className="mt-auto animate-slide-up will-change-transform"
          style={{
            animationDuration: "0.7s",
            animationDelay: `${0.4 + 0.1 * index}s`,
          }}
        >
          {categoryList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categoryList.slice(0, 3).map((category, idx) => (
                <Badge key={idx} label={category} />
              ))}
              {categoryList.length > 3 && (
                <span className="text-xs text-gray-500 self-center">
                  +{categoryList.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className={"flex justify-between"}>
          <div className="text-xs text-gray-500">
            {formatDate(blog.pubDate)}
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={blog.link}
                target="_blank"
                className="group p-2 bg-white rounded-lg border-1 border-black hover:bg-gray-50 transition-all duration-300 ease-out hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                <ExternalLink className="w-4 h-4 stroke-[1.5] transition-transform duration-300 ease-out group-hover:scale-110" />
              </Link>
            </TooltipTrigger>
            <TooltipContent>Visit </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
