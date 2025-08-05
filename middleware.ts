import {withAuth} from "next-auth/middleware";
import createMiddleware from "next-intl/middleware";
import {routing} from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
 function onSuccess(req) {
  return intlMiddleware(req);
 },
 {
  callbacks: {
   authorized: ({token}) => !!token,
  },
 }
);

export default function middleware(req: any) {
 const {pathname} = req.nextUrl;

 // Apply auth middleware to protected routes
 const protectedPatterns = [
  /^\/[^\/]+\/dashboard/,
  /^\/[^\/]+\/boards\/[^\/]+\/edit/,
  /^\/[^\/]+\/boards\/[^\/]+\/analytics/,
 ];

 const isProtectedRoute = protectedPatterns.some((pattern) =>
  pattern.test(pathname)
 );

 if (isProtectedRoute) {
  return authMiddleware(req);
 }

 return intlMiddleware(req);
}

export const config = {
 matcher: [
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
 ],
};
