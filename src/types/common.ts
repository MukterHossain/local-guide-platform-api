import { Profile, User, UserRole, UserStatus } from "@prisma/client";

export type IJWTPayload = {
    id: string;
    email: string;
    role: UserRole;
}

export type UserWithProfile = Omit<User, "password"> & {
    profile?: Profile | null;
};


