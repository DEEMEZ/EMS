// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb"; // Make sure this path is correct for your project
import User from "@/models/user";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await dbConnect();
          
          // Find user by email
          const user = await User.findOne({ email: credentials?.email });
          if (!user) {
            throw new Error("No user found with this email");
          }
          
          // Check password
          const isPasswordCorrect = await bcrypt.compare(
            credentials?.password || "", 
            user.password
          );
          
          if (!isPasswordCorrect) {
            throw new Error("Invalid credentials");
          }
          
          // Important: Return user with MongoDB _id converted to string
          return {
            id: user._id.toString(),
            name: user.fullname,
            email: user.email,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    // Save the user ID to the token when signing in
    async jwt({ token, user }) {
      if (user) {
        // When user signs in, we get the ID from the user object
        console.log("JWT callback - user:", user);
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    // Copy data from the token to the session when creating a session
    async session({ session, token }) {
      console.log("Session callback - token:", token);
      if (token && session.user) {
        // Add the user ID from the token to the session
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: true, // Enable debug mode to see more detailed logs
});

export { handler as GET, handler as POST };