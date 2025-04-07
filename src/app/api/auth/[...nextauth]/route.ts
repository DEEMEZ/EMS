// src/app/api/auth/[...nextauth]/route.ts
import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
    const user = await User.findOne({ email: credentials?.email });
    
    if (!user) throw new Error("No user found");
    if (!user.isVerified) throw new Error("Please verify your email first");
    
    const isValid = await bcrypt.compare(credentials?.password || "", user.password);
    if (!isValid) throw new Error("Invalid credentials");
    
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.fullname
    };
  } catch (error) {
    console.error("Auth error:", error);
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", 
  },
  debug: true,
});

export { handler as GET, handler as POST };

