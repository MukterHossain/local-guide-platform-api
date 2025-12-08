import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { IJWTPayload, UserWithProfile } from "../../types/common";
import { fileUploader } from "../../helper/fileUploader";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const createUser = async (req: Request): Promise<UserWithProfile> => {
    const { role, profile, email, password } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists?.role === UserRole.TOURIST) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User already exists")
    }
    if (exists?.role === UserRole.GUIDE) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide already exists")
    }

    if (role === UserRole.GUIDE && !profile) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile data is required")
    }

    if (role === UserRole.GUIDE) {
        if (!profile.languages || !profile.experienceYears || !profile.feePerHour) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Missing guide profile fields.")
        }
    }

    const hasshedPassword = await bcrypt.hash(req.body.password, 10);


    let user = await prisma.user.create({
        data: {
            email: req.body.email,
            password: hasshedPassword,
            name: req.body.name,
            phone: req.body.phone,
            role: req.body.role as UserRole || UserRole.TOURIST,
            address: req.body.address,
            image: null
        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            address: true,
            image: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true
        }
    })
    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file) as string;
        console.log("uploadResult", uploadResult);
        // req.body.image = uploadResult?.secure_url
        user = await prisma.user.update({
            where: { id: user.id },
            data: { image: uploadResult },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                address: true,
                image: true,
                needPasswordChange: true,
                status: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }
 let finalUser: UserWithProfile = { ...user };
    // guide profile
    if (role === UserRole.GUIDE) {
        if (!profile) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile data is required")
        }
        await prisma.profile.create({
            data: {
                userId: user.id,
                bio: profile.bio,
                avgRating: profile.avgRating,
                languages: profile.languages || [],
                experienceYears: profile.experienceYears,
                feePerHour: profile.feePerHour,
                locationId: profile.locationId ?? null,
            }
        })
    }

   
    if (role === UserRole.GUIDE) {
        const guideProfile = await prisma.profile.findUnique({
            where: {
                userId: user.id
            }
        })
        console.log("user", user)
         finalUser.profile = guideProfile;
    }

    return finalUser
}
const createAdmin = async (req: Request): Promise<UserWithProfile> => {
    const { email, password, name, phone, address } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Admin already exists")
    }

    const hasshedPassword = await bcrypt.hash(req.body.password, 10);

    let admin = await prisma.user.create({
        data: {
            email, password: hasshedPassword, name, phone, role: "ADMIN", address, image: null
        },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
            address: true,
            image: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            createdAt: true,
            updatedAt: true
        }
    })
    if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file) as string;
        console.log("uploadResult", uploadResult);
        admin = await prisma.user.update({
            where: { id: admin.id },
            data: { image: uploadResult },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                address: true,
                image: true,
                needPasswordChange: true,
                status: true,
                isDeleted: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }




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
            address: true,
            image: true,
            needPasswordChange: true,
            status: true,
            isDeleted: true,
            avgRating: true,
            createdAt: true,
            updatedAt: true,
            profile: true
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
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true
        }
    })
    let profileData;
    if (userInfo.role === UserRole.TOURIST) {
        profileData = await prisma.user.findUniqueOrThrow({
            where: {
                email: user.email,
                status: UserStatus.ACTIVE
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                address: true,
                image: true,
                needPasswordChange: true,
                status: true,
                isDeleted: true,
                avgRating: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }
    if (userInfo.role === UserRole.GUIDE) {
        profileData = await prisma.user.findUniqueOrThrow({
            where: {
                email: user.email
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                address: true,
                image: true,
                needPasswordChange: true,
                status: true,
                isDeleted: true,
                avgRating: true,
                createdAt: true,
                updatedAt: true,
                profile: {
                    select: {
                        bio: true,
                        languages: true,
                        experienceYears: true,
                        feePerHour: true,
                        availableStatus: true,
                        verificationStatus: true,
                        adminNote: true
                    }
                }
            }
        })
    }
    if (userInfo.role === UserRole.ADMIN) {
        profileData = await prisma.user.findUniqueOrThrow({
            where: {
                email: user.email
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                address: true,
                image: true,
                needPasswordChange: true,
                status: true,
                isDeleted: true,
                avgRating: true,
                createdAt: true,
                updatedAt: true
            }
        })
    }
    return {
        ...userInfo,
        ...profileData
    }
}
const updateMyProfie = async (user: IJWTPayload, req: Request) => {
    const currentUserInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });

    let imageUrl = currentUserInfo.image;
    if (req.file) {
        const upload = await fileUploader.uploadToCloudinary(req.file);
            imageUrl = typeof upload === "string" ? upload : Array.isArray(upload) ? upload[0] : imageUrl;
    
    }

    const body = req.body;
    if(currentUserInfo.role === UserRole.TOURIST || currentUserInfo.role === UserRole.ADMIN){
        const updated = await prisma.user.update({
            where: {id: currentUserInfo.id},
            data: {
                ...body, image: imageUrl
            }

        })
        return updated;
    }
    // Guide
    if(currentUserInfo.role === UserRole.GUIDE){
        const { profile, ...userData } = body;
        const updated= await prisma.user.update({
            where: {id: currentUserInfo.id},
            data: {
                ...userData, image: imageUrl,
                profile: {
                    update: {
                        ...profile
                    }
                }
            }
        })
        return updated;
    }
    throw new ApiError(httpStatus.BAD_REQUEST, "Unable to update profile")
}


const changeUserStatus = async (id: string, payload: { status: UserStatus }) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })

    if (userData.role === UserRole.ADMIN) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only admin can update user status")
    }


    const updateUserStatus = await prisma.user.update({
        where: {
            id
        },
        data: payload
    })

    return updateUserStatus;
};





export const UserService = {
    createUser,
    createAdmin,
    getAllFromDB,
    getMyProfile,
    updateMyProfie,
    changeUserStatus
}