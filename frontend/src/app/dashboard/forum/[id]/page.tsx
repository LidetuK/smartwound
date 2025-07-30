"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/services/api";
import Button from "@/components/Button";
import Link from "next/link";
import { FaUser, FaClock, FaReply, FaTrash, FaFlag } from "react-icons/fa";

interface ForumPost {
  id: string;
  user_id: string;
  wound_type: string;
  content: string;
  flagged: boolean;
  created_at: string;
  User: {
    id: string;
    full_name: string;
  };
  ForumComments: ForumComment[];
}

interface ForumComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  flagged: boolean;
  created_at: string;
  User: {
    id: string;
    full_name: string;
  };
}

export default function ForumPostPage({ params }: { params: { id: string } }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    
    if (token && params.id) {
      fetchPost();
    }
  }, [user, token, isLoading, router, params.id]);

  const fetchPost = async () => {
    try {
      setIsPostLoading(true);
      const response = await apiClient.get(`/forum/posts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(response.data);
    } catch (error) {
      console.error("Failed to fetch forum post:", error);
      router.push("/dashboard/forum");
    } finally {
      setIsPostLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsCommenting(true);
      await apiClient.post(`/forum/posts/${params.id}/comments`, {
        content: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNewComment("");
      setShowCommentForm(false);
      fetchPost(); // Refresh post with new comment
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiClient.delete(`/forum/posts/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/dashboard/forum");
    } catch (error) {
      console.error("Failed to delete post:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await apiClient.delete(`/forum/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPost(); // Refresh post
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || isPostLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
          <Link href="/dashboard/forum" className="text-indigo-600 hover:text-indigo-800">
            ← Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/dashboard/forum" className="text-indigo-600 hover:text-indigo-800 font-medium">
              ← Back to Forum
            </Link>
            <div className="flex items-center space-x-2">
              {user?.id === post.user_id && (
                <Button
                  onClick={handleDeletePost}
                  variant="secondary"
                  className="flex items-center space-x-2 text-red-600 hover:text-red-800"
                >
                  <FaTrash className="w-4 h-4" />
                  <span>Delete Post</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Main Post */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{post.User.full_name}</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <FaClock className="w-4 h-4" />
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {post.wound_type}
                </span>
              </div>
              
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  {post.ForumComments.length} {post.ForumComments.length === 1 ? 'comment' : 'comments'}
                </div>
                <Button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  variant="primary"
                  className="flex items-center space-x-2"
                >
                  <FaReply className="w-4 h-4" />
                  <span>Reply</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add a Comment</h3>
                <form onSubmit={handleAddComment}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                    rows={4}
                    placeholder="Share your thoughts, experience, or advice..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
                  />
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      onClick={() => setShowCommentForm(false)}
                      variant="secondary"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isCommenting}
                    >
                      {isCommenting ? "Posting..." : "Post Comment"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Comments ({post.ForumComments.length})
            </h3>
            
            {post.ForumComments.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 mb-4">No comments yet. Be the first to share your thoughts!</p>
                <Button
                  onClick={() => setShowCommentForm(true)}
                  variant="primary"
                >
                  Add First Comment
                </Button>
              </div>
            ) : (
              post.ForumComments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{comment.User.full_name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <FaClock className="w-3 h-3" />
                            <span>{formatDate(comment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      {user?.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete comment"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
