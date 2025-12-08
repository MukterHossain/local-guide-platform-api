import { prisma } from "../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma, UserRole } from "@prisma/client";
import ApiError from "../../error/ApiError";


const insertIntoDB = async (user: IJWTPayload, payload: { tourId: string, rating: number, comment?: string }) => {

    if (user.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only TOURIST can create reviews");
    }
    const { tourId, rating, comment } = payload;
    const booking = await prisma.booking.findFirst({
        where: {
            tourId,
            userId: user.id,
            status: 'COMPLETED'
        }
    })
    if (!booking) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Cannot review a tour you didn't complete")
    };

    const tour = await prisma.tour.findUniqueOrThrow({
        where: { id: tourId },
    });

    return await prisma.$transaction(async (tnx) => {
        const review = await tnx.review.create({
            data: {
                userId: user.id,
                guideId: tour.guideId,
                tourId,
                rating,
                comment
            }
        });

        const avgRating = await tnx.review.aggregate({
            _avg: {
                rating: true
            },
            where: { guideId: tour.guideId }
        })

        await tnx.user.update({
            where: {
                id: tour.guideId
            },
            data: {
                avgRating: avgRating._avg.rating ?? 0
            }
        })

        return review;
    })
};


const getAllFromDB = async (
    filters: any,
    options: IOptions,
) => {
    const { limit, page, skip } = paginationHelper.calculatePagination(options);
    const { userEmail, guideEmail, tourId, userId, guideId } = filters;
    const andConditions: Prisma.ReviewWhereInput[] = [];

    if (userEmail) {
        andConditions.push({
            user: {
                email: {contains:userEmail, mode: 'insensitive'}
            }
        })
    }

    if (guideEmail) {
        andConditions.push({
            guide: {
                email: { contains: guideEmail, mode: "insensitive" } 
            }
        })
    }
      if (tourId) {
        andConditions.push({ tourId });
    }

    if (userId) {
        andConditions.push({ userId });
    }

    if (guideId) {
        andConditions.push({ guideId });
    }

    const whereConditions: Prisma.ReviewWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.review.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy:
            options.sortBy && options.sortOrder
                ? { [options.sortBy]: options.sortOrder }
                : {
                    createdAt: 'desc',
                },
        include: {
            user: true,
            guide: true,
            tour: true,
        },
    });
    const total = await prisma.review.count({
        where: whereConditions,
    });

    return {
        meta: {
            total,
            page,
            limit,
        },
        data: result,
    };
};

export const ReviewService = {
    insertIntoDB,
    getAllFromDB
}