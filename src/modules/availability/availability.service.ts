import { Prisma, UserRole } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { availabilitySearchableFields } from "./availability.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user: IJWTPayload, startAt: Date, endAt: Date) => {
    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide can create availability");
    }
    if (startAt >= endAt) {
        throw new ApiError(httpStatus.BAD_REQUEST, "End time must be after start time");
    }
    const isExist = await prisma.availability.findFirst({
        where: {
            startAt: startAt,
            endAt: endAt
        }
    })
    const guideId = user.id
    if (isExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Availability already exists.");
    }
    const availability = await prisma.availability.create({
        data: {
            guideId,
            startAt: startAt,
            endAt: endAt
        }

    })

    return availability
}

const getAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.AvailabilityWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: availabilitySearchableFields.map(field => ({
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

    const whereConditions: Prisma.AvailabilityWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const categories = await prisma.availability.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            guide: true
        }
    })
    const total = await prisma.availability.count({
        where: whereConditions
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: categories
    }
}
const getMyAvailability = async (params: any, options: IOptions, user: IJWTPayload) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide can get availability");
    }
    const andConditions: Prisma.AvailabilityWhereInput[] = [];
    andConditions.push({
        guideId: user.id,
    });
    if (searchTerm) {
        andConditions.push({
            OR: availabilitySearchableFields.map(field => ({
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

    const whereConditions: Prisma.AvailabilityWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const availability = await prisma.availability.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            guide: true
        }
    })
    const total = await prisma.availability.count({
        where: whereConditions
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: availability
    }
}
const getSingleByIdFromDB = async (user: IJWTPayload, id: string) => {
    if (user.role !== UserRole.GUIDE && user.role !== UserRole.ADMIN) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide or Admin is allowed to access availability details");
    }
    const availability = await prisma.availability.findUniqueOrThrow({
        where: { id: id },

        include: {
            guide: true
        }
    })

    if (!availability) {
        throw new ApiError(httpStatus.NOT_FOUND, "Availability not found");
    }

    return availability
}



const updateIntoDB = async (user: IJWTPayload, id: string, startAt: Date, endAt: Date) => {
    const avail = await prisma.availability.findUniqueOrThrow({ where: { id: id } });

    if (user.role !== UserRole.GUIDE || avail.guideId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only the guide can update availability");
    }


    const allowedFields = ["startAt", "endAt"];

    const filteredData = Object.fromEntries(
        Object.entries({ startAt, endAt }).filter(([key]) => allowedFields.includes(key))
    )

    if (Object.keys(filteredData).length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No valid fields to update");
    }

    const updateData = await prisma.availability.update({
        where: { id: id },
        data: filteredData,
        include: {
            guide: true
        }
    })


    return updateData
}
const deleteFromDB = async (id: string) => {
    const bookingData = await prisma.availability.findUniqueOrThrow({ where: { id: id } });
    if (!bookingData) {
        throw new ApiError(httpStatus.NOT_FOUND, "Availability not found");
    }
    if (bookingData.isBooked === true) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Availability is already booked");
    }
    const result = await prisma.availability.delete({
        where: { id: id }
    })
    return result

}










export const AvailabilityService = {
    inserIntoDB,
    getAllFromDB,
    getMyAvailability,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}