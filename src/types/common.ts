import { Profile, User, UserRole } from "@prisma/client";

export type IJWTPayload = {
    email: string;
    role: UserRole;
}

export type UserWithProfile = User & {
    profile?: Profile | null;
};