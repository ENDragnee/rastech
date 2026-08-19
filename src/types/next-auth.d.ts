// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

export interface ISession {
  id: string;
  name?: string | null | undefined;
  userName: string;
  role: string[];
  permissions: string[];
}

declare module "next-auth" {
  interface Session {
    user?: ISession & DefaultSession["user"];
  }

  interface User extends ISession {}
}

declare module "next-auth/jwt" {
  interface JWT extends ISession {
    exp: number;
    token: string;
    invalid?: boolean;
  }
}
