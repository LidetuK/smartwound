"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Wound, ForumPost, ForumComment, ModerationQueue, ModerationFilters, WoundComment } from '@/types/moderation';

export default function ModerationQueuePage() {
  const [wounds, setWounds] = useState<Wound[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueue>({ posts: [], comments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'wounds' | 'forum-posts' | 'forum-comments'>('wounds');
  const [filters, setFilters] = useState<ModerationFilters>({
    contentType: 'all',
    flagged: 'all'
  });
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [woundComments, setWoundComments] = useState<Record<string, WoundComment[]>>({});
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch wounds
      const woundsRes = await axios.get('http://localhost:3001/api/admin/wounds', { withCredentials: true });
      setWounds(woundsRes.data);

      // Fetch moderation queue (flagged forum content)
      const queueRes = await axios.get('http://localhost:3001/api/admin/moderation/queue', { withCredentials: true });
      setModerationQueue(queueRes.data);

      // Fetch comments for flagged wounds
      const flaggedWounds = woundsRes.data.filter((w: Wound) => w.flagged);
      for (const wound of flaggedWounds) {
        await fetchWoundComments(wound.id);
      }
    } catch (err: any) {
      setError('Failed to load moderation data. ' + (err?.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const fetchWoundComments = async (woundId: string) => {
    setCommentsLoading(prev => ({ ...prev, [woundId]: true }));
    try {
      const res = await axios.get(`http://localhost:3001/api/admin/wounds/${woundId}/comments`, { withCredentials: true });
      setWoundComments(prev => ({ ...prev, [woundId]: res.data }));
    } catch (err) {
      setWoundComments(prev => ({ ...prev, [woundId]: [] }));
    }
    setCommentsLoading(prev => ({ ...prev, [woundId]: false }));
  };

  const handleFlagWound = async (id: string) => {
    try {
      await axios.put(`http://localhost:3001/api/admin/wounds/${id}/flag`, {}, { withCredentials: true });
      setWounds(prev => prev.map(w => w.id === id ? { ...w, flagged: !w.flagged } : w));
      
      // If wound is now flagged, fetch its comments
      const wound = wounds.find(w => w.id === id);
      if (wound && !wound.flagged) {
        await fetchWoundComments(id);
      }
    } catch {
      alert('Failed to flag wound.');
    }
  };

  const handleFlagForumPost = async (id: string, flag: boolean) => {
    try {
      const endpoint = flag ? 'flag' : 'unflag';
      await axios.put(`http://localhost:3001/api/admin/forum/posts/${id}/${endpoint}`, {}, { withCredentials: true });
      setModerationQueue(prev => ({
        ...prev,
        posts: prev.posts.map(p => p.id === id ? { ...p, flagged: flag } : p)
      }));
    } catch {
      alert(`Failed to ${flag ? 'flag' : 'unflag'} post.`);
    }
  };

  const handleDeleteForumPost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/admin/forum/posts/${id}`, { withCredentials: true });
      setModerationQueue(prev => ({
        ...prev,
        posts: prev.posts.filter(p => p.id !== id)
      }));
    } catch {
      alert('Failed to delete post.');
    }
  };

  const handleFlagForumComment = async (id: string, flag: boolean) => {
    try {
      const endpoint = flag ? 'flag' : 'unflag';
      await axios.put(`http://localhost:3001/api/admin/forum/comments/${id}/${endpoint}`, {}, { withCredentials: true });
      setModerationQueue(prev => ({
        ...prev,
        comments: prev.comments.map(c => c.id === id ? { ...c, flagged: flag } : c)
      }));
    } catch {
      alert(`Failed to ${flag ? 'flag' : 'unflag'} comment.`);
    }
  };

  const handleDeleteForumComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/admin/forum/comments/${id}`, { withCredentials: true });
      setModerationQueue(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== id)
      }));
    } catch {
      alert('Failed to delete comment.');
    }
  };

  const handleAddWoundComment = async (woundId: string) => {
    const comment = commentInputs[woundId]?.trim();
    if (!comment) return;
    
    try {
      await axios.post(`http://localhost:3001/api/admin/wounds/${woundId}/comments`, { comment }, { withCredentials: true });
      await fetchWoundComments(woundId);
      setCommentInputs(prev => ({ ...prev, [woundId]: '' }));
    } catch {
      alert('Failed to add comment.');
    }
  };

  const handleDeleteWoundComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`http://localhost:3001/api/admin/wound-comments/${commentId}`, { withCredentials: true });
      // Refresh wound comments for all wounds
      const flaggedWounds = wounds.filter(w => w.flagged);
      for (const wound of flaggedWounds) {
        await fetchWoundComments(wound.id);
      }
    } catch {
      alert('Failed to delete comment.');
    }
  };

  const filteredWounds = wounds.filter(wound => {
    if (filters.flagged === 'flagged' && !wound.flagged) return false;
    if (filters.flagged === 'not-flagged' && wound.flagged) return false;
    return true;
  });

  const filteredForumPosts = moderationQueue.posts.filter(post => {
    if (filters.flagged === 'flagged' && !post.flagged) return false;
    if (filters.flagged === 'not-flagged' && post.flagged) return false;
    return true;
  });

  const filteredForumComments = moderationQueue.comments.filter(comment => {
    if (filters.flagged === 'flagged' && !comment.flagged) return false;
    if (filters.flagged === 'not-flagged' && comment.flagged) return false;
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading moderation queue...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderation Queue</h1>
          <p className="text-gray-600">Review and moderate flagged content across the platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Flagged Wounds</h3>
            <p className="text-2xl font-bold text-red-600">{wounds.filter(w => w.flagged).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Flagged Posts</h3>
            <p className="text-2xl font-bold text-orange-600">{moderationQueue.posts.filter(p => p.flagged).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Flagged Comments</h3>
            <p className="text-2xl font-bold text-yellow-600">{moderationQueue.comments.filter(c => c.flagged).length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Items</h3>
            <p className="text-2xl font-bold text-blue-600">
              {wounds.length + moderationQueue.posts.length + moderationQueue.comments.length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.flagged}
                onChange={(e) => setFilters(prev => ({ ...prev, flagged: e.target.value as any }))}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All Items</option>
                <option value="flagged">Flagged Only</option>
                <option value="not-flagged">Not Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('wounds')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'wounds'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Wounds ({filteredWounds.length})
              </button>
              <button
                onClick={() => setActiveTab('forum-posts')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'forum-posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Forum Posts ({filteredForumPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('forum-comments')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'forum-comments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Forum Comments ({filteredForumComments.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Wounds Tab */}
            {activeTab === 'wounds' && (
              <div className="space-y-4">
                {filteredWounds.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No wounds found matching the current filters.</p>
                ) : (
                  filteredWounds.map(wound => (
                    <div key={wound.id} className={`border rounded-lg p-4 ${
                      wound.flagged ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {wound.User?.full_name || 'Unknown User'}
                          </h4>
                          <p className="text-sm text-gray-600">{wound.User?.email}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {wound.type}
                            </span>
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {wound.severity}
                            </span>
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              {wound.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFlagWound(wound.id)}
                            className={`px-4 py-2 rounded text-sm font-medium ${
                              wound.flagged
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {wound.flagged ? 'Unflag' : 'Flag'}
                          </button>
                        </div>
                      </div>
                      
                      {wound.flagged && (
                        <div className="mt-4 border-t pt-4">
                          <h5 className="font-medium mb-2">Admin Comments</h5>
                          {commentsLoading[wound.id] ? (
                            <p className="text-gray-500">Loading comments...</p>
                          ) : (
                            <div className="space-y-2 mb-3">
                              {(woundComments[wound.id] || []).map(comment => (
                                <div key={comment.id} className="bg-gray-100 p-2 rounded text-sm flex justify-between items-start">
                                  <div>
                                    <strong>{comment.admin?.full_name || 'Admin'}:</strong> {comment.comment}
                                    <span className="text-gray-500 ml-2">
                                      {formatDate(comment.createdAt)}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteWoundComment(comment.id)}
                                    className="text-red-600 hover:text-red-800 text-xs ml-2 flex-shrink-0"
                                    title="Delete comment"
                                  >
                                    Delete
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentInputs[wound.id] || ''}
                              onChange={(e) => setCommentInputs(prev => ({ ...prev, [wound.id]: e.target.value }))}
                              placeholder="Add admin comment..."
                              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                            />
                            <button
                              onClick={() => handleAddWoundComment(wound.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                            >
                              Add Comment
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Forum Posts Tab */}
            {activeTab === 'forum-posts' && (
              <div className="space-y-4">
                {filteredForumPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No forum posts found matching the current filters.</p>
                ) : (
                  filteredForumPosts.map(post => (
                    <div key={post.id} className={`border rounded-lg p-4 ${
                      post.flagged ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {post.User?.full_name || 'Unknown User'}
                            </h4>
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                              {post.wound_type}
                            </span>
                            {post.flagged && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                FLAGGED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{truncateText(post.content)}</p>
                          <p className="text-sm text-gray-500">
                            Posted on {formatDate(post.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleFlagForumPost(post.id, !post.flagged)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              post.flagged
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {post.flagged ? 'Unflag' : 'Flag'}
                          </button>
                          <button
                            onClick={() => handleDeleteForumPost(post.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Forum Comments Tab */}
            {activeTab === 'forum-comments' && (
              <div className="space-y-4">
                {filteredForumComments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No forum comments found matching the current filters.</p>
                ) : (
                  filteredForumComments.map(comment => (
                    <div key={comment.id} className={`border rounded-lg p-4 ${
                      comment.flagged ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {comment.User?.full_name || 'Unknown User'}
                            </h4>
                            {comment.flagged && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                FLAGGED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 mb-2">{truncateText(comment.content)}</p>
                          {comment.ForumPost && (
                            <p className="text-sm text-gray-500 mb-2">
                              On post: {truncateText(comment.ForumPost.content, 50)}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Posted on {formatDate(comment.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleFlagForumComment(comment.id, !comment.flagged)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              comment.flagged
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {comment.flagged ? 'Unflag' : 'Flag'}
                          </button>
                          <button
                            onClick={() => handleDeleteForumComment(comment.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
