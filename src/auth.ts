import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import { comparePassword } from "@/lib/password";
import { loginSchema } from "@/lib/validations";
import { UserRole, UserStatus } from "@/lib/constants";
import AuditLog from "@/models/AuditLog";
import User from "@/models/User";

class SuspendedAccountError extends CredentialsSignin {
  code = "suspended";
}

class ServiceUnavailableError extends CredentialsSignin {
  code = "service_unavailable";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Phone number or email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const identifier = parsed.data.identifier.trim();

        let user;
        try {
          await connectDB();

          user = await User.findOne({
            $or: [
              { phone: identifier },
              { email: identifier.toLowerCase() },
            ],
          }).select("+passwordHash");
        } catch (error) {
          console.error("Authentication service unavailable", {
            cause: error instanceof Error ? error.message : "Unknown error",
          });
          throw new ServiceUnavailableError();
        }

        if (!user) {
          return null;
        }

        if (user.status !== UserStatus.ACTIVE) {
          throw new SuspendedAccountError();
        }

        const passwordMatches = await comparePassword(
          parsed.data.password,
          user.passwordHash,
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.fullName,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email ?? "",
          role: user.role,
          status: user.status,
          healthCentreId: user.healthCentreId?.toString(),
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.fullName = user.fullName;
        token.phone = user.phone;
        token.email = user.email;
        token.role = user.role;
        token.status = user.status;
        token.healthCentreId = user.healthCentreId;
      }

      return token;
    },
    session({ session, token }) {
      const id = typeof token.id === "string" ? token.id : "";
      const fullName =
        typeof token.fullName === "string" ? token.fullName : "";
      const phone = typeof token.phone === "string" ? token.phone : "";
      const role = token.role as UserRole;
      const status = token.status as UserStatus;

      if (
        !id ||
        !fullName ||
        !phone ||
        !Object.values(UserRole).includes(role) ||
        !Object.values(UserStatus).includes(status)
      ) {
        throw new Error("Invalid session token");
      }

      session.user.id = id;
      session.user.fullName = fullName;
      session.user.name = fullName;
      session.user.phone = phone;
      session.user.email = typeof token.email === "string" ? token.email : "";
      session.user.role = role;
      session.user.status = status;
      session.user.healthCentreId =
        typeof token.healthCentreId === "string"
          ? token.healthCentreId
          : undefined;

      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await connectDB();
        await AuditLog.create({
          actorId: user.id,
          action: "LOGIN",
          entityType: "User",
          entityId: user.id,
          description: "User logged in successfully",
        });
      } catch (error) {
        console.error("Unable to record login audit event", error);
      }
    },
  },
});
