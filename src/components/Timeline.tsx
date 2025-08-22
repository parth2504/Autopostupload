import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

interface ScheduledPost {
  id: string;
  content: string;
  scheduledTime: Date;
  createdAt: Date;
  isPublished: boolean;
}

interface TimelineProps {
  publishedPosts: ScheduledPost[];
}

const Timeline: React.FC<TimelineProps> = React.memo(({ publishedPosts }) => (
  <Card className="relative overflow-hidden">
    <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-br from-blue-50 to-indigo-100 transform rotate-45 -translate-x-3 -translate-y-3" />
    <div className="absolute bottom-0 right-0 w-6 h-6 bg-gradient-to-br from-blue-50 to-indigo-100 transform rotate-45 translate-x-3 translate-y-3" />
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-xl">
        <Calendar className="h-5 w-5 text-green-600" />
        Published Timeline
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[calc(100vh-350px)] overflow-y-auto space-y-4">
        {publishedPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg mb-2">No posts published yet</p>
            <p className="text-sm">
              Scheduled posts will appear here when their time arrives
            </p>
          </div>
        ) : (
          publishedPosts.map((post) => (
            <div
              key={post.id}
              className="border-l-4 border-green-500 pl-4 pb-4"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Published
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(post.scheduledTime, "PPp")}
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
                <div className="text-xs text-gray-400 mt-2">
                  Scheduled on {format(post.createdAt, "PPp")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
));

export default Timeline;
