import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateUser } from "@/app/lib/services/authService";

// NextAuth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Delegate to your service layer
      authorize: authenticateUser,
    }),
  ],

  // Custom sign‑in page
  pages: {
    signIn: "/login",
  },

  // Use JWT sessions
  session: {
    strategy: "jwt",
  },

  // Attach user ID into token and session
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },

  // Cryptographic secret for JWT/cookies
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth handler for both GET and POST
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
