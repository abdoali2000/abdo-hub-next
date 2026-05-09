import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { Role } from "@prisma/client"

import { prisma } from "@/lib/prisma"

function isRole(value: unknown): value is Role {
  return value === Role.USER || value === Role.SELLER || value === Role.ADMIN
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password

        if (typeof email !== "string" || typeof password !== "string") {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await compare(password, user.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && isRole(user.role)) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const latestUser = token.sub
          ? await prisma.user.findUnique({
              where: { id: token.sub },
              select: { role: true },
            })
          : null
        session.user.id = token.sub ?? ""
        session.user.role = latestUser?.role ?? (isRole(token.role) ? token.role : Role.USER)
      }
      return session
    },
  },
})
