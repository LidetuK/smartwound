export interface Wound {
  id: string;
  type: string;
  severity: string;
  status: string;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  User?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface WoundComment {
  id: string;
  comment: string;
  createdAt: string;
  admin?: {
    full_name: string;
  };
}

export interface ForumPost {
  id: string;
  wound_type: string;
  content: string;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    id: string;
    full_name: string;
    email: string;
  };
}

export interface ForumComment {
  id: string;
  content: string;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  User?: {
    id: string;
    full_name: string;
    email: string;
  };
  ForumPost?: {
    id: string;
    content: string;
  };
}

export interface ModerationQueue {
  posts: ForumPost[];
  comments: ForumComment[];
}

export interface ModerationFilters {
  contentType: 'all' | 'wounds' | 'forum-posts' | 'forum-comments';
  flagged: 'all' | 'flagged' | 'not-flagged';
  woundType?: string;
  severity?: string;
}
