import { BlogPost } from "@/app/utils/blog";
import BlogCardClient from "./client";

export default function BlogCard({
  post,
  index,
}: {
  post: BlogPost;
  index: number;
}) {
  return <BlogCardClient post={post} index={index} />;
}
