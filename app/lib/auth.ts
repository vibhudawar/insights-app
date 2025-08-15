import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (token.id && session.user) {
        // Fetch complete user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            username: true,
            country: true,
            account_tier: true,
            created_at: true,
            updated_at: true,
          },
        });

        if (dbUser) {
          session.user = {
            ...session.user,
            ...dbUser,
          };
        } else {
          session.user.id = token.id;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}