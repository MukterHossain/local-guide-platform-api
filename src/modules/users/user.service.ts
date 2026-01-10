import { GuideVerificationStatus, Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { IJWTPayload, UserWithProfile } from "../../types/common";
import { fileUploader } from "../../helper/fileUploader";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
import { CreateAdminInput } from "./user.interface";


const createUser = async (req: Request): Promise<UserWithProfile> => {
    const { name, email, password, phone, gender, role, profile } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already exists")
    }

    if (role === UserRole.GUIDE && !profile) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile data is required")
    }


    const hasshedPassword = await bcrypt.hash(req.body.password, 10);


    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hasshedPassword,
            phone,
            role,
        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
        }
    })
    await prisma.profile.create({
        data: {
            userId: user.id,
            image: profile?.image,
            bio: profile?.bio,
            languages: profile?.languages ?? [],
            gender,
            address: profile?.address,

            expertise: role === UserRole.GUIDE ? profile?.expertise : undefined,
            experienceYears:
                role === UserRole.GUIDE ? profile?.experienceYears : undefined,
            dailyRate: role === UserRole.GUIDE ? profile?.dailyRate : undefined,
            locationId: role === UserRole.GUIDE ? profile?.locationId : undefined,
        },
    });

    if (role === UserRole.GUIDE && profile?.locationIds?.length) {
        const guideLocationsData = profile.locationIds.map((locationId: string) => ({
            guideId: user.id,
            locationId
        }))
        await prisma.guideLocation.createMany({
            data: guideLocationsData,
            skipDuplicates: true
        })
    }

    if (role === UserRole.TOURIST) {
        await prisma.touristPreference.create({
            data: {
                userId: user.id,
                interests: [],
                preferredLangs: [],
                travelStyle: "BUDGET",
                groupSize: 1,
                travelPace: "RELAXED",
            },
        });
    }

    return prisma.user.findUniqueOrThrow({
        where: { id: user.id },
        include: {
            profile: true,
            touristPreference: true,
        },
    });
}
const createAdmin = async (payload: CreateAdminInput) => {
    const exists = await prisma.user.findUnique({ where: { email: payload.email } })
    if (exists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Admin already exists")
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const admin = await prisma.user.create({
        data: {
            ...payload,
            password: hashedPassword,
            role: UserRole.ADMIN,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    })
    return admin as UserWithProfile
}


const getAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const total = await prisma.user.count({
        where: whereConditions
    })
    const result = await prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        where: {
            AND: andConditions,

        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
            touristPreference: true
        }
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}
const getGuidesAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }
    andConditions.push({ role: "GUIDE" });

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const total = await prisma.user.count({
        where: whereConditions
    })
    const result = await prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        where: {
            AND: andConditions,

        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
            touristPreference: true
        }
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}
const getTouristsAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
                [field]: {
                    contains: searchTerm,
                    mode: "insensitive"
                }
            }))
        })
    }

    if (Object.keys(filterData).length > 0) {
        andConditions.push({
            AND: Object.keys(filterData).map(key => ({
                [key]: {
                    equals: (filterData as any)[key]
                }
            }))
        })
    }

    andConditions.push({ role: "TOURIST" });
    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const total = await prisma.user.count({
        where: whereConditions
    })
    const result = await prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        where: {
            AND: andConditions,

        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
            touristPreference: true
        }
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

const getMyProfile = async (user: IJWTPayload) => {
    const userInfo = await prisma.user.findFirstOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        },
        include: {
            profile: true,
            touristPreference: true,
            guideLocations: { include: { location: true } },
            tours: {
                include: {
                    categories: true,
                    availabilities: true,
                    reviews: true,
                },
            },
            bookings: {
                include: {
                    tour: true,
                    availability: true,
                    payment: true,
                },
            },
            reviews: {
                include: {
                    tour: true,
                    user: true,
                },
            },
            wishlist: {
                include: {
                    tour: true,
                },
            },
            availabilities: true,
            guideReviews: true,
            reportsFiled: true,
            reportsAgainst: true,
            adminReports: true,

        },
    })
    return userInfo
}

const getSingleByIdFromDB = async (user: IJWTPayload, id: string) => {

    if (user.role !== UserRole.ADMIN) {
        throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    }

    return await prisma.user.findUniqueOrThrow({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true,
            profile: true,
            touristPreference: true
        }
    });
}
const updateMyProfile = async (user: IJWTPayload, req: Request) => {
    const currentUserInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email
        },
        include: { profile: true, touristPreference: true }
    });
    const guideOnlyFields = [
        "expertise",
        "experienceYears",
        "dailyRate",
        "locationIds"
    ];
    if (user.role === UserRole.TOURIST && req.body.profile) {
        const hasGuideField = guideOnlyFields.some(field => Object.keys(req.body.profile).includes(field));
        if (hasGuideField) {
            throw new ApiError(httpStatus.FORBIDDEN, "Tourist cannot update guide fields. Please, become a guide ");
        }

    }

    let imageUrl = currentUserInfo.profile?.image;

    if (req.file) {
        imageUrl = (await fileUploader.uploadToCloudinary(req.file)) as string;
    }
    const payload = req.body;

    const data: any = {
        name: payload.name,
        phone: payload.phone,
    }

    if (payload.profile) {
        data.profile = {
            upsert: {
                create: {
                    image: imageUrl,
                    bio: payload.profile.bio,
                    languages: payload.profile.languages ?? [],
                    address: payload.profile.address,
                    gender: payload.profile.gender,
                    // Guide fields
                    expertise: payload.profile.expertise,
                    experienceYears: payload.profile.experienceYears,
                    dailyRate: payload.profile.dailyRate,

                },
                update: {
                    image: imageUrl,
                    bio: payload.profile.bio,
                    languages: payload.profile.languages ?? [],
                    address: payload.profile.address,
                    gender: payload.profile.gender,
                    // Guide fields
                    expertise: payload.profile.expertise,
                    experienceYears: payload.profile.experienceYears,
                    dailyRate: payload.profile.dailyRate,
                }
            }
        }
    }





    if (payload.touristPreference) {
        data.touristPreference = {
            upsert: {
                create: payload.touristPreference,
                update: payload.touristPreference
            }
        }
    }

    const updatedUser = await prisma.user.update({
        where: { id: currentUserInfo.id },
        data,
        include: {
            profile: true,
            touristPreference: true,
        },
    });

    const locationIds: string[] = payload.profile?.locationIds ?? [];

    if (user.role === UserRole.GUIDE) {
        // Remove old guide locations 
        await prisma.guideLocation.deleteMany({
            where: { guideId: currentUserInfo.id }
        })

        // Add new guide locations
        if (locationIds.length > 0) {

            await prisma.guideLocation.createMany({
                data: locationIds.map((locationId: string) => ({
                    guideId: currentUserInfo.id,
                    locationId
                })
                ),
                skipDuplicates: true
            })
        }
    }

    return updatedUser;
}


const becomeGuide = async (user: IJWTPayload, payload: {
    expertise: string;
    experienceYears: number;
    dailyRate: number;
    locationIds: string[];
}) => {
    const existUser = await prisma.user.findUniqueOrThrow({
        where: {
            id: user.id
        },
        include: { profile: true }
    });

    if (existUser.role === UserRole.GUIDE) {
        throw new ApiError(httpStatus.BAD_REQUEST,
            "You are already a guide")
    }
    if (existUser.role === UserRole.ADMIN) {
        throw new ApiError(httpStatus.BAD_REQUEST,
            "Admin cannot become a guide")
    }
    if (user.role !== UserRole.TOURIST) {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Only tourists can apply to become a guide"
        );
    }
    const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
            where: { id: existUser.id },
            data: {
                role: UserRole.GUIDE
            }
        });

        const profile = await tx.profile.upsert({
            where: { userId: existUser.id },
            create: {
                userId: existUser.id,
                expertise: payload.expertise,
                experienceYears: payload.experienceYears,
                dailyRate: payload.dailyRate,
                // locationId: payload.locationId,
                verificationStatus: GuideVerificationStatus.PENDING
            },
            update: {
                expertise: payload.expertise,
                experienceYears: payload.experienceYears,
                dailyRate: payload.dailyRate,
                // locationId: payload.locationId,
                verificationStatus: GuideVerificationStatus.PENDING
            }
        });

        await tx.guideLocation.deleteMany({ where: { guideId: existUser.id } });

        const guideLocations = await tx.guideLocation.createMany({
            data: payload.locationIds.map((locationId: string) => ({
                guideId: existUser.id,
                locationId
            })),
            skipDuplicates: true
        })

        return { updatedUser, profile, guideLocations };
    })

    return result;
}


const changeUserStatus = async (id: string, payload: { status?: UserStatus, verificationStatus?: GuideVerificationStatus, adminNote?: string }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id
        },
        include: { profile: true }
    })

    if (userData.role === UserRole.ADMIN) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only admin can update user status")
    }


    const updateUserStatus = await prisma.user.update({
        where: {
            id
        },
        data: {
            status: payload.status,
            profile: payload.verificationStatus || payload.adminNote ? {
                update: {
                    verificationStatus: payload.verificationStatus,
                    adminNote: payload.adminNote
                }
            } : undefined
        },
        include: {
            profile: true
        }
    })

    return updateUserStatus;
};

const deleteFromDB = async (id: string) => {
    const result = await prisma.user.delete({
        where: { id: id }
    })
    return result

}
const softDeleteFromDB = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id }
    });
    if (!user || user.isDeleted) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    if (user.status === UserStatus.DELETED) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already deleted");
    }
    const result = await prisma.user.update({
        where: { id },
        data: {
            isDeleted: true,
            status: UserStatus.BLOCKED
        }
    });
    return result

}





export const UserService = {
    createUser,
    createAdmin,
    getAllFromDB,
    getGuidesAllFromDB,
    getTouristsAllFromDB,
    getMyProfile,
    getSingleByIdFromDB,
    updateMyProfile,
    becomeGuide,
    changeUserStatus,
    deleteFromDB,
    softDeleteFromDB
}