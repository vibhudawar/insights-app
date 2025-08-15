declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      username?: string | null
      country?: string | null
      account_tier?: "FREE" | "PRO" | "ENTERPRISE" | null
      created_at?: Date | null
      updated_at?: Date | null
    }
  }

  interface User {
    id: string
    username?: string | null
    country?: string | null
    account_tier?: "FREE" | "PRO" | "ENTERPRISE" | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
  }
}