// /auth.js
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/database/database";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            // The credentials object is used to generate a form on the default sign-in page.
            // You don't need it if you have a custom sign-in page.
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Add a check to ensure credentials exist
                if (!credentials || !credentials.email || !credentials.password) {
                    throw new Error("Mohon masukkan username dan password.");
                }

                await connectToDatabase();

                try {
                    // Find the user by their username
                    const user = await User.findOne({ email: credentials.email });

                    if (!user) {
                        // Use a generic error message for security
                        throw new Error("Email atau password salah.");
                    }

                    // Check if the password is correct
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                    if (!isPasswordCorrect) {
                        throw new Error("Email atau password salah.");
                    }

                    // If everything is correct, return the user object
                    // This object will be available in the 'user' parameter of the jwt callback
                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };

                } catch (error) {
                    // Re-throw the error to be caught by NextAuth
                    throw new Error(error.message || "Terjadi kesalahan saat otentikasi.");
                }
            }
        })
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 1 day
    },
    callbacks: {
        async redirect(url, baseUrl) {
            return url.startsWith(baseUrl)
                ? url
                : baseUrl
        },
        async jwt({ token, user }) {
            // The 'user' object is only passed on the initial sign-in
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            // Add properties from the token to the session object
            if (token && session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: "/auth/signin",
        signOut: "/auth/signout",
    },
    secret: process.env.NEXTAUTH_SECRET,
};