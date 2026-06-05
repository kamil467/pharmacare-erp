import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "owner" | "staff";
    name: string;
    email: string;
  }

  interface Session {
    user: User & {
      id: string;
      role: "owner" | "staff";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "owner" | "staff";
  }
}
