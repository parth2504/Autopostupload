import React, { useState, useEffect, useMemo, useCallback } from "react";
import PostForm from "../components/PostForm";
import Timeline from "../components/Timeline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledTime: Date;
  createdAt: Date;
  isPublished: boolean;
}

export default function ScheduledPostApp() {
  const [postContent, setPostContent] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load posts from localStorage on component mount
  useEffect(() => {
    const savedPosts = localStorage.getItem("scheduledPosts");
    if (savedPosts) {
      const parsedPosts = JSON.parse(savedPosts).map(
        (post: {
          id: string;
          content: string;
          scheduledTime: string;
          createdAt: string;
          isPublished: boolean;
        }) => ({
          ...post,
          scheduledTime: new Date(post.scheduledTime),
          createdAt: new Date(post.createdAt),
        })
      );
      setPosts(parsedPosts);
    }
  }, []);

  // Cron job simulation - update current time and check for posts to publish
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if any posts should be published
      setPosts((prevPosts) => {
        const updatedPosts = prevPosts.map((post) => {
          if (!post.isPublished && post.scheduledTime <= now) {
            return { ...post, isPublished: true };
          }
          return post;
        });

        // Save to localStorage if there were changes
        if (JSON.stringify(updatedPosts) !== JSON.stringify(prevPosts)) {
          localStorage.setItem("scheduledPosts", JSON.stringify(updatedPosts));
        }

        return updatedPosts;
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  // Memoized minimum datetime for input (current time + 1 minute)
  const minDateTime = useMemo(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  }, [currentTime]);

  // Memoized sorted and filtered posts
  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => b.scheduledTime.getTime() - a.scheduledTime.getTime()
      ),
    [posts]
  );
  const publishedPosts = useMemo(
    () => sortedPosts.filter((post) => post.isPublished),
    [sortedPosts]
  );
  const pendingCount = useMemo(
    () => posts.filter((p) => !p.isPublished).length,
    [posts]
  );

  // Memoized handlers
  const handlePostContent = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setPostContent(e.target.value.slice(0, 280)),
    []
  );
  const handleScheduledDateTime = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setScheduledDateTime(e.target.value),
    []
  );
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!postContent.trim() || !scheduledDateTime) {
        alert("Please fill in both the content and scheduled time");
        return;
      }
      const scheduledTime = new Date(scheduledDateTime);
      const now = new Date();
      if (scheduledTime <= now) {
        alert("Please select a future date and time");
        return;
      }
      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        content: postContent.trim(),
        scheduledTime,
        createdAt: now,
        isPublished: false,
      };
      const updatedPosts = [...posts, newPost];
      setPosts(updatedPosts);
      localStorage.setItem("scheduledPosts", JSON.stringify(updatedPosts));
      setPostContent("");
      setScheduledDateTime("");
    },
    [postContent, scheduledDateTime, posts]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Scheduled Post Manager
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <PostForm
            postContent={postContent}
            handlePostContent={handlePostContent}
            scheduledDateTime={scheduledDateTime}
            handleScheduledDateTime={handleScheduledDateTime}
            onSubmit={handleSubmit}
            minDateTime={minDateTime}
            pendingCount={pendingCount}
            currentTime={currentTime}
          />
          <Timeline publishedPosts={publishedPosts} />
        </div>
        {/* All Posts Debug View (for development) */}
        {process.env.NODE_ENV === "development" && posts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">All Posts (Debug View)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="truncate mr-4">{post.content}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={post.isPublished ? "default" : "secondary"}
                      >
                        {post.isPublished ? "Published" : "Pending"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {format(post.scheduledTime, "MMM dd, HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
