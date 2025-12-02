import { Profile, User, UserRole } from "@prisma/client";

export type IJWTPayload = {
    id: string;
    email: string;
    role: UserRole;
}

export type UserWithProfile = User & {
    profile?: Profile | null;
};

// export type UserWithProfile = User & {
//     profile?: {
//         id: string;
//         languages: string[];
//         experienceYears: number | null;
//         pricePerHour: number | null;
//         bio: string | null;
//         availableStatus: boolean;
//         verificationStatus: GuideVerificationStatus;
//         nidOrPassportUrl: string | null;
//         adminNote: string | null;
//         userId: string;
//         locationId: string | null;
//     } | null;
// };