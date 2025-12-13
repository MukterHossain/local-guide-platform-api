import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { wishlistSearchableFields } from "./wishlist.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user: IJWTPayload, payload: any) => {
    if (user.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Tourist can create wishlist");
    }

    const isExist = await prisma.wishlist.findFirst({
        where: {
            title: payload.title,
            message: payload.message
        }
    })
    if (isExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Wishlist already exists.");
    }

    const result = await prisma.wishlist.create({
        data: {
            ...payload,
            userId: user.id
        }
    })

    return result
}

const getAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.WishlistWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: wishlistSearchableFields.map(field => ({
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

    const whereConditions: Prisma.WishlistWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const result = await prisma.wishlist.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    image: true,
                    address: true,
                    role: true,
                    status: true,
                    createdAt: true,
                }
            }
        }
    })
    const total = await prisma.wishlist.count({
        where: whereConditions
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: result
    }
}
const getSingleByIdFromDB = async (user: IJWTPayload, id: string) => {

    if (user.role !== UserRole.TOURIST && user.role !== UserRole.ADMIN) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Tourist and Admin can view wishlist");
    }
    const wishlist = await prisma.wishlist.findUniqueOrThrow({
        where: { id: id },
        include: {
            user: true
        }
    })


    return wishlist
}



const updateIntoDB = async (user: IJWTPayload, id: string, payload: any) => {

    const isExist = await prisma.wishlist.findUniqueOrThrow({
        where: { id: id }
    })

    if (user.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Tourist can update wishlist");
    }

    if (isExist.userId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to update this wishlist");
    }



    const allowedFields = ["title", "message", "meta", "read"];

    Object.keys(payload).forEach(key => {
        if (!allowedFields.includes(key)) {
            delete payload[key];
        }
    });

    if (Object.keys(payload).length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No valid fields to update");
    }

    const result = await prisma.wishlist.update({
        where: { id: id },
        data: payload,
        include: {
            user: true
        }
    })


    return result
}
const deleteFromDB = async (id: string) => {
    const result = await prisma.wishlist.delete({
        where: { id: id }
    })
    return result

}










export const WishlistService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}