import { Prisma, TourStatus, User, UserRole, UserStatus } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { tourSearchableFields } from "./tour.constant";
import { fileUploader } from "../../helper/fileUploader";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user: IJWTPayload, tourData: any, files: Express.Multer.File[]) => {
    if (user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Guide can create tours");
    }
    const findGuideStatus = await prisma.user.findUnique({
        where: {
            id: user.id,
            profile: {
                verificationStatus: "VERIFIED"
            }
        },

    })

    if (!findGuideStatus) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Guide profile is not verified");
    }

    const isExist = await prisma.tour.findFirst({
        where: {
            title: tourData.title,
            city: tourData.city,
            guideId: user.id
        }
    })

    if (isExist) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Tour already created. Please modify data.");
    }
    // const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
        const imageUrls = await fileUploader.uploadToCloudinary(files);
        tourData.images = imageUrls;
    }
    const tour = await prisma.tour.create({
        data: {
            title: tourData.title,
            description: tourData.description,
            city: tourData.city,
            durationHours: tourData.durationHours,
            tourFee: tourData.tourFee,
            maxPeople: tourData.maxPeople,
            meetingPoint: tourData.meetingPoint,
            images: tourData.images,
            guideId: user.id,
            categories: {
                create: tourData.categories.map((cat: any) => ({
                    categoryId: cat.categoryId
                }))
            }
        },
        include: {
            categories: { include: { category: true } }
        }

    });
    console.log("bookingData", tour)

    return tour
}

const getAllFromDB = async (params: any, options: IOptions, user?: IJWTPayload | null) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.TourWhereInput[] = [
        { isDeleted: false },
    ];

    if (!user || user.role === UserRole.TOURIST) {
        andConditions.push({ status: "PUBLISHED" });
    }

    if (user?.role === UserRole.GUIDE) {
        andConditions.push({
            OR: [
                { status: "PUBLISHED" },
                { guideId: user.id },
            ],
        });
    }

    if (searchTerm) {
        andConditions.push({
            OR: tourSearchableFields.map(field => ({
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

    const whereConditions: Prisma.TourWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const tours = await prisma.tour.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        select: {
            id: true,
            title: true,
            city: true,
            description: true,
            tourFee: true,
            durationHours: true,
            images: true,
            status: true,
            maxPeople: true,
            createdAt: true,
            updatedAt: true,

            guide: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    profile: {
                        select: {
                            id: true,
                            verificationStatus: true,
                            image: true,
                            languages: true,
                            bio: true,
                            address: true,
                            dailyRate: true,
                            experienceYears: true,
                        }
                    },
                    createdAt: true,
                    updatedAt: true
                }
            }
        },
    })
    const total = await prisma.tour.count({
        where: whereConditions
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: tours
    }
}
const getTourListforPublic = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.TourWhereInput[] = [
        { status: "PUBLISHED" },
        { isDeleted: false },
    ];

    if (searchTerm) {
        andConditions.push({
            OR: tourSearchableFields.map(field => ({
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
    // andConditions.push({ role: "GUIDE" });

    const whereConditions: Prisma.TourWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const total = await prisma.tour.count({
        where: whereConditions
    })
    const result = await prisma.tour.findMany({
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
            title: true,
            city: true,
            description: true,
            tourFee: true,
            durationHours: true,
            images: true,
            status: true,
            maxPeople: true,
            createdAt: true,
            updatedAt: true,
            guide: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    profile: {
                        select: {
                            id: true,
                            verificationStatus: true,
                            image: true,
                            languages: true,
                            bio: true,
                            address: true,
                            dailyRate: true,
                            experienceYears: true,
                        }
                    },
                    createdAt: true,
                    updatedAt: true
                }
            }
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

const getSingleByIdFromDB = async (user: IJWTPayload, id: string) => {
    const tour = await prisma.tour.findUniqueOrThrow({
        where: { id: id },
        include: {
            guide: {
                include: {
                    profile: true
                }
            }
        }
    })

    if (!tour) {
        throw new ApiError(httpStatus.NOT_FOUND, "Tour not found");
    }

    if (user.role === UserRole.ADMIN) {
        return tour
    }
    if (user.role === UserRole.TOURIST) {
        return tour
    }

    if (user.role === UserRole.GUIDE && tour.guideId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to view this booking");
    }

    return tour
}
const getPublicById = async (id: string) => {
    const tour = await prisma.tour.findUniqueOrThrow({
        where: {
            id,
            status: "PUBLISHED",
            isDeleted: false,
        },
        select: {
            id: true,
            title: true,
            description: true,
            city: true,
            durationHours: true,
            images: true,
            tourFee: true,
            maxPeople: true,
            meetingPoint: true,
            // categories : true,

            guide: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    phone: true,
                    profile: {
                        select: {
                            id: true,
                            image: true,
                            verificationStatus: true,
                            bio: true,
                            languages: true,
                            address: true,
                            dailyRate: true,
                            experienceYears: true,
                        }
                    },
                    createdAt: true,
                    updatedAt: true
                }
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
            categories: {
                select: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        }
    }
    )
    const avgRating =
        tour.reviews.reduce((a, b) => a + b.rating, 0) /
        (tour.reviews.length || 1)

    return {
        ...tour,
        avgRating,
        reviewCount: tour.reviews.length,
        categories: tour.categories.map(c => c.category)
    }
}

const getMyTours = async (user: IJWTPayload) => {
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Tourist can view their bookings");
    }
    if (user.role === UserRole.GUIDE) {
        return prisma.tour.findMany({
            where: {
                guideId: user.id
            },
            include: {
                guide: true
            }
        });
    }
    const bookings = await prisma.tour.findMany({
        where: {
            guideId: user.id
        },
        include: {
            guide: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })


    return bookings
}

const updateIntoDB = async (user: IJWTPayload, id: string, payload: any) => {

    const existingBooking = await prisma.tour.findUniqueOrThrow({
        where: { id }
    })

    if (user.role === UserRole.TOURIST) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Tourist are not allowed to update tour");
    }

    if (user.role === UserRole.GUIDE && existingBooking.guideId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to update this tour");
    }
    // date chane or cancel booking logic
    const allowedFields = ["title", "description", "tourFee", "durationHours", "maxPeople", "city", "meetingPoint", "images"];

    const updateData: any = {};

    for (const key of allowedFields) {
        if (payload[key] !== undefined && payload[key] !== null) {
            updateData[key] = payload[key];
        }
    }

    if (!Object.keys(updateData).length && !payload.categories) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No valid fields to update");
    }
    const updatedTour = await prisma.$transaction(async (tx) => {

        if (payload.categories) {
            await tx.tourCategory.deleteMany({
                where: { tourId: id }
            })

            await tx.tourCategory.createMany({
                data: payload.categories.map((category: any) => ({
                    tourId: id,
                    categoryId: category.categoryId
                }))
            })
        }

        return tx.tour.update({
            where: { id },
            data: updateData,
            include: {
                guide: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        })
    })

    return updatedTour

}
const changeTourListStatus = async (id: string, status: TourStatus) => {

    if (!Object.values(TourStatus).includes(status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status value")
    }

    await prisma.tour.findUniqueOrThrow({
        where: { id: id },
    })
    const updateTourListStatus = await prisma.tour.update({
        where: {
            id
        },
        data: {
            status,
        },
    })

    return updateTourListStatus;
};
const deleteFromDB = async (id: string) => {
    const result = await prisma.tour.delete({
        where: { id: id }
    })
    return result

}










export const TourService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    getTourListforPublic,
    getPublicById,
    getMyTours,
    updateIntoDB,
    changeTourListStatus,
    deleteFromDB,
}