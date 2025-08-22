import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Clock, Send, Calendar } from "lucide-react";
import { format } from "date-fns";

interface PostFormProps {
  postContent: string;
  handlePostContent: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  scheduledDateTime: string;
  handleScheduledDateTime: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  minDateTime: string;
  pendingCount: number;
  currentTime: Date;
}

const PostForm: React.FC<PostFormProps> = React.memo(
  ({
    postContent,
    handlePostContent,
    scheduledDateTime,
    handleScheduledDateTime,
    onSubmit,
    minDateTime,
    pendingCount,
    currentTime,
  }) => (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-br from-blue-50 to-indigo-100 transform rotate-45 translate-x-3 -translate-y-3" />
      <div className="absolute bottom-0 left-0 w-6 h-6 bg-gradient-to-br from-blue-50 to-indigo-100 transform rotate-45 -translate-x-3 translate-y-3" />
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Send className="h-5 w-5 text-blue-600" />
          Create Scheduled Post
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">
              Post Content
            </Label>
            <textarea
              id="content"
              value={postContent}
              onChange={handlePostContent}
              placeholder="What would you like to share?"
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={280}
            />
            <div className="text-xs text-gray-500 text-right">
              {postContent.length}/280 characters
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="datetime" className="text-sm font-medium">
              Schedule for
            </Label>
            <div className="relative">
              <Input
                id="datetime"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={handleScheduledDateTime}
                min={minDateTime}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200"
            disabled={!postContent.trim() || !scheduledDateTime}
          >
            <Clock className="mr-2 h-4 w-4" />
            Schedule Post
          </Button>
        </form>
        <Separator />
        <div className="text-center text-sm text-gray-600">
          <Clock className="inline h-4 w-4 mr-1" />
          Current time: {format(currentTime, "PPpp")}
        </div>
        {pendingCount > 0 && (
          <div className="text-center">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {pendingCount} post(s) scheduled
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
);

export default PostForm;
