import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { bookingSearchableFields } from "./booking.constant";

const createBooking = async (user:IJWTPayload, tourId: string, bookingDate:Date)=>{
    if(user.role !== UserRole.USER){
        throw new Error("Only users can create bookings");
    }

    // const dbUser = await prisma.user.findUniqueOrThrow({
    //     where:{email:user.email}
    // })

    const tour = await prisma.tour.findUniqueOrThrow({where:{id: tourId}});


    const booking = await prisma.booking.create({
        data:{
            tourId,
            userId: user.id,
            bookingDate,
            totalPrice: tour.price
        }
    })
    console.log("bookingData", booking)
     
    return booking
}
const getAllFromDB =async(params:any, options: IOptions)=>{
 
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
        meta:{
        page,
        limit,
        total
    }, 
    data:bookings}
}
const getSingleByIdFromDB = async (user:IJWTPayload, bookingId:string)=>{
    const booking = await prisma.booking.findUniqueOrThrow({
        where:{id: bookingId},
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

    if(!booking){
        throw new Error("Booking not found");
    }
    
    if(user.role === UserRole.USER && booking.userId !== user.id){
        throw new Error("You are not authorized to view this booking");
    }
    if(user.role === UserRole.GUIDE && booking.tour.guideId !== user.id){
        throw new Error("You are not authorized to view this booking");
    }
     
    return booking
}

const getMyBooking = async (user: IJWTPayload) => {
    if(user.role !== UserRole.USER && user.role !== UserRole.GUIDE){
        throw new Error("Only users can view their bookings");
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

const updateIntoDB = async (user:IJWTPayload, bookingId:string, payload:any)=>{
    
    const existingBooking = await prisma.booking.findUniqueOrThrow({
        where:{id: bookingId},
        include: {tour: true}
    })

    if(user.role === UserRole.USER && existingBooking.userId !== user.id){
        throw new Error("You are not authorized to update this booking");
    }
    // date chane or cancel booking logic
    const allowedFieldsForUser = ["bookingDate", "status"];
    const allowedStatusForUser = ["CANCELLED"];

    if(user.role === UserRole.USER){
        Object.keys(payload).forEach(key => {
            if (!allowedFieldsForUser.includes(key)) {
                delete payload[key];
            }
        });

        if (payload.status && !allowedStatusForUser.includes(payload.status)) {
            throw new Error("Invalid status for user");
        }
    }

    if(Object.keys(payload).length === 0){
        throw new Error("No valid fields to update");
    }

    const updatedBooking = await prisma.booking.update({
        where:{id: bookingId},
        data:payload,
        include: {
            tour: true,
            user: true
        }
    })
    
     
    return  updatedBooking
}
const deleteFromDB = async (bookingId:string)=>{
    const result = await prisma.booking.delete({
        where:{id: bookingId}
    })
    return result   
    
}










export const BookingService = {
    createBooking,
    getAllFromDB,
    getSingleByIdFromDB,
    getMyBooking,
    updateIntoDB,
    deleteFromDB
}