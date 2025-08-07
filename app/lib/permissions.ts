import {getServerSession} from "next-auth/next";
import {authOptions} from "./auth";
import {prisma} from "./prisma";
import {NextRequest, NextResponse} from "next/server";
import {ensureUserExists} from "./user-sync";

/**
 * Permission helper functions for user content management and moderation
 */

export interface FeatureRequestWithBoard {
 id: string;
 submitter_id?: string | null;
 board: {
  id: string;
  creator_id: string;
 };
}

export interface CommentWithFeatureRequest {
 id: string;
 author_id?: string | null;
 feature_request: {
  id: string;
  board: {
   creator_id: string;
  };
 };
}

/**
 * Check if user can modify a feature request
 * Users can modify their own requests, board owners can modify any request on their board
 */
export function canModifyFeatureRequest(
 userId: string,
 featureRequest: FeatureRequestWithBoard
): boolean {
 return (
  userId === featureRequest.submitter_id || // Own content
  userId === featureRequest.board.creator_id // Board owner
 );
}

/**
 * Check if user can modify a comment
 * Users can modify their own comments, board owners can moderate any comment on their board
 */
export function canModifyComment(
 userId: string,
 comment: CommentWithFeatureRequest
): boolean {
 return (
  userId === comment.author_id || // Own comment
  userId === comment.feature_request.board.creator_id // Board owner
 );
}

/**
 * Check if user is the board owner
 */
export function isBoardOwner(userId: string, boardCreatorId: string): boolean {
 return userId === boardCreatorId;
}

/**
 * Authentication middleware wrapper
 * Returns 401 if user is not authenticated
 */
export function requireAuth<T extends unknown[]>(
 handler: (req: NextRequest, ...args: T) => Promise<NextResponse> | NextResponse
) {
 return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
   return NextResponse.json(
    {success: false, error: "Authentication required"},
    {status: 401}
   );
  }

  // Ensure user exists in database
  try {
   await ensureUserExists(session);
  } catch (error) {
   console.error("User sync error:", error);
   return NextResponse.json(
    {success: false, error: "User authentication failed"},
    {status: 401}
   );
  }

  // Add session to the request for use in the handler
  (req as NextRequest & {session: typeof session}).session = session;
  return handler(req, ...args);
 };
}

/**
 * Feature request ownership middleware
 * Validates that user can modify the feature request (owner or board moderator)
 */
export function requireFeatureRequestOwnership<T extends unknown[]>(
 handler: (
  req: NextRequest,
  featureRequest: FeatureRequestWithBoard,
  session: {user: {id: string}},
  ...args: T
 ) => Promise<NextResponse> | NextResponse
) {
 return requireAuth(async (req: NextRequest, ...args: T) => {
  const session = (req as NextRequest & {session: {user: {id: string}}})
   .session;
  const featureRequestId = (args[0] as {params: {id: string}})?.params?.id;

  if (!featureRequestId) {
   return NextResponse.json(
    {success: false, error: "Feature request ID required"},
    {status: 400}
   );
  }

  // Get feature request with board info
  const featureRequest = await prisma.featureRequest.findUnique({
   where: {id: featureRequestId},
   select: {
    id: true,
    submitter_id: true,
    board: {
     select: {
      id: true,
      creator_id: true,
     },
    },
   },
  });

  if (!featureRequest) {
   return NextResponse.json(
    {success: false, error: "Feature request not found"},
    {status: 404}
   );
  }

  if (!canModifyFeatureRequest(session.user.id, featureRequest)) {
   return NextResponse.json(
    {success: false, error: "Insufficient permissions"},
    {status: 403}
   );
  }

  return handler(req, featureRequest, session, ...args);
 });
}

/**
 * Comment ownership middleware
 * Validates that user can modify the comment (author or board moderator)
 */
export function requireCommentOwnership<T extends unknown[]>(
 handler: (
  req: NextRequest,
  comment: CommentWithFeatureRequest,
  session: {user: {id: string}},
  ...args: T
 ) => Promise<NextResponse> | NextResponse
) {
 return requireAuth(async (req: NextRequest, ...args: T) => {
  const session = (req as NextRequest & {session: {user: {id: string}}})
   .session;
  const commentId = (args[0] as {params: {commentId: string}})?.params
   ?.commentId;

  if (!commentId) {
   return NextResponse.json(
    {success: false, error: "Comment ID required"},
    {status: 400}
   );
  }

  // Get comment with feature request and board info
  const comment = await prisma.comment.findUnique({
   where: {id: commentId},
   select: {
    id: true,
    author_id: true,
    feature_request: {
     select: {
      id: true,
      board: {
       select: {
        creator_id: true,
       },
      },
     },
    },
   },
  });

  if (!comment) {
   return NextResponse.json(
    {success: false, error: "Comment not found"},
    {status: 404}
   );
  }

  if (!canModifyComment(session.user.id, comment)) {
   return NextResponse.json(
    {success: false, error: "Insufficient permissions"},
    {status: 403}
   );
  }

  return handler(req, comment, session, ...args);
 });
}

/**
 * Board ownership middleware
 * Validates that user is the board owner
 */
export function requireBoardOwnership<T extends unknown[]>(
 handler: (
  req: NextRequest,
  board: {id: string; creator_id: string},
  session: {user: {id: string}},
  ...args: T
 ) => Promise<NextResponse> | NextResponse
) {
 return requireAuth(async (req: NextRequest, ...args: T) => {
  const session = (req as NextRequest & {session: {user: {id: string}}})
   .session;
  const boardSlug = (args[0] as {params: {slug: string}})?.params?.slug;

  if (!boardSlug) {
   return NextResponse.json(
    {success: false, error: "Board slug required"},
    {status: 400}
   );
  }

  // Get board info
  const board = await prisma.board.findUnique({
   where: {slug: boardSlug},
   select: {
    id: true,
    creator_id: true,
   },
  });

  if (!board) {
   return NextResponse.json(
    {success: false, error: "Board not found"},
    {status: 404}
   );
  }

  if (!isBoardOwner(session.user.id, board.creator_id)) {
   return NextResponse.json(
    {success: false, error: "Board owner permissions required"},
    {status: 403}
   );
  }

  return handler(req, board, session, ...args);
 });
}

/**
 * Get current session or return null
 */
export async function getCurrentSession() {
 try {
  return await getServerSession(authOptions);
 } catch (error) {
  console.error("Error getting session:", error);
  return null;
 }
}

/**
 * Get user ID from session or throw error
 */
export async function requireUserId(): Promise<string> {
 const session = await getCurrentSession();

 if (!session?.user?.id) {
  throw new Error("Authentication required");
 }

 return session.user.id;
}
