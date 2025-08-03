import { User, Board, FeatureRequest, Comment, Upvote, AccountTier, RequestStatus } from '@prisma/client'

// Extended types with relations
export type UserWithBoards = User & {
  boards: Board[]
}

export type BoardWithRequests = Board & {
  feature_requests: FeatureRequest[]
  creator: User
}

export type FeatureRequestWithDetails = FeatureRequest & {
  board: Board
  upvotes: Upvote[]
  comments: CommentWithReplies[]
}

export type CommentWithReplies = Comment & {
  replies: Comment[]
}

// Board Analytics Type
export interface BoardAnalytics {
  totalRequests: number;
  totalUpvotes: number;
  totalComments: number;
  statusBreakdown: {
    new: number;
    inProgress: number;
    shipped: number;
    cancelled: number;
  };
  recentActivity: {
    date: string;
    requestsCount: number;
    upvotesCount: number;
  }[];
  topRequests: FeatureRequest[];
}

// Dashboard Stats Type
export interface DashboardStats {
  totalBoards: number;
  totalRequests: number;
  totalUpvotes: number;
  activeBoards: number;
}

// Form types
export interface CreateBoardFormData {
  title: string;
  description?: string;
  slug: string;
  themeConfig?: Record<string, unknown>;
  isPublic: boolean;
}

export interface UpdateBoardFormData {
  title?: string;
  description?: string;
  slug?: string;
  themeConfig?: Record<string, unknown>;
  isPublic?: boolean;
}

export interface CreateFeatureRequestFormData {
  title: string;
  description?: string;
  submitterName?: string;
  submitterEmail?: string;
}

export interface CreateCommentFormData {
  content: string;
  authorName: string;
  authorEmail: string;
  parentCommentId?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Re-export Prisma types
export type {
  User,
  Board,
  FeatureRequest,
  Comment,
  Upvote,
  AccountTier,
  RequestStatus,
};