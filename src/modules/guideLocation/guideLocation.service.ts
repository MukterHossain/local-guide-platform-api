import { Prisma, UserRole } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { locationSearchableFields } from "../location/location.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user: IJWTPayload, locationId: string) => {
    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide can create location");
    }
    const guideId = user.id;
    const isExist = await prisma.guideLocation.findFirst({
        where: {
            guideId,
            locationId
        }
    })
    if (isExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide Location already exists.");
    }
    const createData = await prisma.guideLocation.create({
        data: {
            guideId,
            locationId
        }

    })

    return createData
}

const getAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)

    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.GuideLocationWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { location: { city: { contains: searchTerm, mode: "insensitive" } } },
                { location: { country: { contains: searchTerm, mode: "insensitive" } } },
            ]
        })
    }

    if (Object.keys(filterData).length > 0) {
        const filterConditions: Prisma.GuideLocationWhereInput[] = [];

        Object.keys(filterData).forEach(key => {
            if (key === "location.city") {
                filterConditions.push({ location: { city: { equals: filterData[key] } } });
            } else if (key === "location.country") {
                filterConditions.push({ location: { country: { equals: filterData[key] } } });
            } else {
                filterConditions.push({ [key]: { equals: filterData[key] } });
            }
        });

        andConditions.push({
            AND: filterConditions
        });
    }

    const whereConditions: Prisma.GuideLocationWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const findData = await prisma.guideLocation.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: sortBy ? {
            [sortBy]: sortOrder
        } : { id: "desc" },

        // include: {
        //     guide: true,
        //     location: true

        // },
        select: {
            id: true,
            guideId: true,
            locationId: true,
            createdAt: true,
            guide: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                },
            },
            location: {
                select: {
                    id: true,
                    city: true,
                    country: true,
                },
            },
        }
    })
    const total = await prisma.guideLocation.count({
        where: whereConditions
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: findData
    }
}
const getMyGuideLocation = async (params: any, options: IOptions, user: IJWTPayload) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide can get guide Location");
    }
    const andConditions: Prisma.GuideLocationWhereInput[] = [];
    andConditions.push({
        guideId: user.id,
    });
    if (searchTerm) {
        andConditions.push({
            OR: [
                { location: { city: { contains: searchTerm, mode: "insensitive" } } },
                { location: { country: { contains: searchTerm, mode: "insensitive" } } },
            ]
        })
    }

   if (Object.keys(filterData).length > 0) {
        const filterConditions: Prisma.GuideLocationWhereInput[] = [];

        Object.keys(filterData).forEach(key => {
            if (key === "location.city") {
                filterConditions.push({ location: { city: { equals: filterData[key] } } });
            } else if (key === "location.country") {
                filterConditions.push({ location: { country: { equals: filterData[key] } } });
            } else {
                filterConditions.push({ [key]: { equals: filterData[key] } });
            }
        });

        andConditions.push({
            AND: filterConditions
        });
    }

    const whereConditions: Prisma.GuideLocationWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const result = await prisma.guideLocation.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            location: true,
            guide: true
        }
    })
    const total = await prisma.guideLocation.count({
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
    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide  is allowed to access guideLocation details");
    }
    const getData = await prisma.guideLocation.findUniqueOrThrow({
        where: { id: id },

        // include: {
        //     guide: true,
        //     location: true
        // }
        select: {
            id: true,
            guideId: true,
            locationId: true,
            createdAt: true,

            guide: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },

            location: {
                select: {
                    id: true,
                    city: true,
                    country: true,
                },
            },
        }
    })

    if (!getData) {
        throw new ApiError(httpStatus.NOT_FOUND, "GuideLocation not found");
    }

    return getData
}




const deleteFromDB = async (id: string) => {
    const result = await prisma.guideLocation.delete({
        where: { id: id }
    })
    return result

}










export const GuideLocationService = {
    inserIntoDB,
    getAllFromDB,
    getMyGuideLocation,
    getSingleByIdFromDB,
    deleteFromDB
}