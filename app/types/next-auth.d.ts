declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      country?: string | null
    }
  }

  interface User {
    id: string
    username?: string | null
    country?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}