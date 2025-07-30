"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/services/api";
import Button from "@/components/Button";
import Link from "next/link";
import { FaPlus, FaSearch, FaComments, FaUser, FaClock, FaFilter } from "react-icons/fa";

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
  ForumComments?: ForumComment[];
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

const WOUND_TYPES = [
  "Cut", "Burn", "Scrape", "Bruise", "Puncture", "Surgical", "Diabetic", "Pressure", "Other"
];

export default function ForumPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWoundType, setSelectedWoundType] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    wound_type: "",
    content: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login");
      return;
    }
    
    if (token) {
      fetchPosts();
    }
  }, [user, token, isLoading, router]);

  const fetchPosts = async () => {
    try {
      setIsPostsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedWoundType) params.append('wound_type', selectedWoundType);
      
      const response = await apiClient.get(`/forum/posts?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error("Failed to fetch forum posts:", error);
    } finally {
      setIsPostsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.content.trim() || !newPost.wound_type) return;

    try {
      setIsCreating(true);
      await apiClient.post('/forum/posts', newPost, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setNewPost({ wound_type: "", content: "" });
      setShowCreatePost(false);
      fetchPosts(); // Refresh posts
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsCreating(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800 font-medium">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
            </div>
            <Button
              onClick={() => setShowCreatePost(true)}
              variant="primary"
              className="flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>New Post</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search and Filter Section */}
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={selectedWoundType}
                  onChange={(e) => setSelectedWoundType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Wound Types</option>
                  {WOUND_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <Button
                onClick={fetchPosts}
                variant="secondary"
                className="flex items-center space-x-2"
              >
                <FaFilter className="w-4 h-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>

          {/* Create Post Modal */}
          {showCreatePost && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Post</h2>
                  <form onSubmit={handleCreatePost} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Wound Type
                      </label>
                      <select
                        value={newPost.wound_type}
                        onChange={(e) => setNewPost({ ...newPost, wound_type: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select wound type</option>
                        {WOUND_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={newPost.content}
                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        required
                        rows={6}
                        placeholder="Share your experience, ask questions, or provide advice..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isCreating}
                      >
                        {isCreating ? "Creating..." : "Create Post"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Posts List */}
          <div className="space-y-6">
            {isPostsLoading ? (
              <div className="text-center py-8">
                <div className="text-lg text-gray-600">Loading posts...</div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <FaComments className="mx-auto w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedWoundType 
                    ? "Try adjusting your search or filter criteria."
                    : "Be the first to start a conversation in the community!"
                  }
                </p>
                <Button
                  onClick={() => setShowCreatePost(true)}
                  variant="primary"
                >
                  Create First Post
                </Button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaUser className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{post.User.full_name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <FaClock className="w-3 h-3" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {post.wound_type}
                      </span>
                    </div>
                    
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <FaComments className="w-4 h-4" />
                          <span>{post.ForumComments?.length || 0} comments</span>
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/forum/${post.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                      >
                        View Discussion →
                      </Link>
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
