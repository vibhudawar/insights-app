import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/boards/:path*/edit",
    "/boards/:path*/analytics",
    "/api/boards/:path*",
    "/api/feature-requests/:path*",
  ],
};