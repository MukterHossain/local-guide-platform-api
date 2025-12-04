import { Profile, User, UserRole } from "@prisma/client";

export type IJWTPayload = {
    id: string;
    email: string;
    role: UserRole;
}

export type UserWithProfile = User & {
    profile?: Profile | null;
};

