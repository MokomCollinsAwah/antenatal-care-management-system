import type { DefaultSession } from "next-auth";
import type { UserRole, UserStatus } from "@/types";

declare module "next-auth" {
  interface User {
    fullName: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    healthCentreId?: string;
  }

  interface Session {
    user: {
      id: string;
      fullName: string;
      phone: string;
      email: string;
      role: UserRole;
      status: UserStatus;
      healthCentreId?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    healthCentreId?: string;
  }
}
