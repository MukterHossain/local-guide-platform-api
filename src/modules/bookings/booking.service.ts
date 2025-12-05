import { BookingStatus, Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { bookingSearchableFields } from "./booking.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
import { uuidv4 } from "zod";
import { stripe } from "../../helper/stripe";
const createBooking = async (user: IJWTPayload, tourId: string, bookingDate: Date) => {
    if (user.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only TOURIST can create bookings");
    }

    const tour = await prisma.tour.findUniqueOrThrow({
        where: { id: tourId },
        include: { guide: true }
    });

    const availability = await prisma.availability.findFirst({
        where: {
            guideId: tour.guideId,
            startAt: { lte: bookingDate },
            endAt: { gte: bookingDate },
            isBooked: false
        }
    })

    if (!availability) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No available slot for the selected date");
    }


    const today = new Date();

    const transactionId = "HealthCare-" + today.getFullYear() + "-" + today.getMonth() + "-" + today.getDay() + "-" + today.getHours() + "-" + today.getMinutes();


    const result = await prisma.$transaction(async (tnx) => {
        const booking = await tnx.booking.create({
            data: {
                tourId,
                userId: user.id,
                bookingDate,
                totalFee: tour.tourFee,
                availabilityId: availability.id
            },
            include: {
                tour: true,
                user: true
            }
        })
        await tnx.availability.update({
            where: {
                id: availability.id
            },
            data: {
                isBooked: true,

            }
        })

        await tnx.payment.create({
            data: {
                bookingId: booking.id,
                amount: tour.tourFee,
                transactionId: transactionId,
            }
        })
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email: user.email,
            line_items: [
                {
                    price_data: {
                        currency: "bdt",
                        product_data: {
                            name: `Booking with guide: ${tour.guide.name} for tour: ${tour.title}`,
                        },
                        unit_amount: tour.tourFee * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                bookingId: booking.id,
                paymentId: transactionId
            },
            success_url: `https://www.programming-hero.com`,
            cancel_url: `https://next.programming-hero.com`,
        });
        console.log("session", session)
        return { booking, paymentUrl: session.url };
    })

    return result;
}
const getAllFromDB = async (params: any, options: IOptions) => {

    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.BookingWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: bookingSearchableFields.map(field => ({
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

    const whereConditions: Prisma.BookingWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const bookings = await prisma.booking.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            tour: true,
            user: true
        }
    })
    const total = await prisma.booking.count({
        where: whereConditions
    })
    return {
        meta: {
            page,
            limit,
            total
        },
        data: bookings
    }
}
const getSingleByIdFromDB = async (user: IJWTPayload, bookingId: string) => {
    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: {
            tour: true,
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    status: true,
                    phone: true,
                    address: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true
                }
            }
        }
    })

    if (!booking) {
        throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
    }

    if (user.role === UserRole.TOURIST && booking.userId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to view this booking");
    }
    if (user.role === UserRole.GUIDE && booking.tour.guideId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to view this booking");
    }

    return booking
}

const getMyBooking = async (user: IJWTPayload) => {
    if (user.role !== UserRole.TOURIST && user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Only Tourist can view their bookings");
    }
    if (user.role === UserRole.GUIDE) {
        return prisma.booking.findMany({
            where: {
                tour: { guideId: user.id }
            },
            include: { tour: true, user: true }
        });
    }
    const bookings = await prisma.booking.findMany({
        where: {
            userId: user.id
        },
        include: {
            tour: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })


    return bookings
}

const updateBookingStatus = async (user: IJWTPayload, bookingId: string, status: BookingStatus) => {

    const booking = await prisma.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: { tour: true }
    })

    if (user.role === UserRole.TOURIST) {
        if (booking.userId !== user.id) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Not your booking");
        }

        if (status !== "CANCELLED") {
            throw new ApiError(httpStatus.BAD_REQUEST, "Tourist can only cancel");
        }
    }

    if (user.role === UserRole.GUIDE) {
        if (booking.tour.guideId !== user.id) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Cannot update other's bookings");
        }
        const allowedStatusForUser = ["CONFIRMED", "COMPLETED", "CANCELLED"];
        if (!allowedStatusForUser.includes(status)) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status");
        }
    }

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status },
        include: {
            tour: true,
            user: true
        }
    })


    return updatedBooking

}
const updateIntoDB = async (user: IJWTPayload, bookingId: string, payload: any) => {

    const existingBooking = await prisma.booking.findUniqueOrThrow({
        where: { id: bookingId },
        include: { tour: true }
    })

    if (user.role === UserRole.TOURIST && existingBooking.userId !== user.id) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized to update this booking");
    }
    // date chane or cancel booking logic
    const allowedFieldsForUser = ["bookingDate", "status"];
    const allowedStatusForUser = ["CANCELLED"];

    if (user.role === UserRole.TOURIST) {
        Object.keys(payload).forEach(key => {
            if (!allowedFieldsForUser.includes(key)) {
                delete payload[key];
            }
        });

        if (payload.status && !allowedStatusForUser.includes(payload.status)) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid status for user");
        }
    }

    if (Object.keys(payload).length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "No valid fields to update");
    }

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: payload,
        include: {
            tour: true,
            user: true
        }
    })


    return updatedBooking
}
const deleteFromDB = async (bookingId: string) => {
    const result = await prisma.booking.delete({
        where: { id: bookingId }
    })
    return result

}










export const BookingService = {
    createBooking,
    getAllFromDB,
    getSingleByIdFromDB,
    getMyBooking,
    updateIntoDB,
    updateBookingStatus,
    deleteFromDB
}