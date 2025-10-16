import type { DefaultSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { User as UserModel, UserRole } from "@/models/User";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      name: string;
      email: string;
    };
  }

  interface User {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    uid: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectToDatabase();
        const userDoc = await UserModel.findOne({ email: credentials.email }).exec();
        if (!userDoc) return null;
        const ok = await bcrypt.compare(credentials.password, userDoc.password);
        if (!ok) return null;
        return {
          id: String(userDoc._id),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = (user as any).id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: String(token.uid),
        role: (token as any).role,
        name: session.user?.name || "",
        email: session.user?.email || "",
      } as any;
      return session;
    },
  },
};


