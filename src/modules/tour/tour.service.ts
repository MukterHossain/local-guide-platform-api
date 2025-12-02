import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { tourSearchableFields } from "./tour.constant";

const createTour = async (user:IJWTPayload, tourData: any)=>{
    if(!["GUIDE", "ADMIN"].includes(user.role)) {
        throw new Error("Only Guide/Admin can create tours");
    }

    const isExist = await prisma.tour.findFirst({
        where:{
            title: tourData.title,
            city: tourData.city,
            guideId: user.id
        }
    })

    if(isExist){
        throw new Error("Tour already created. Please modify data.");
    }
    const tour = await prisma.tour.create({
        data: {
            ...tourData,
            guideId: user.id
        }
    });
    console.log("bookingData", tour)
     
    return tour
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.TourWhereInput[] = [];
    
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
        include: {
            guide: {
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
    const total = await prisma.tour.count({
        where: whereConditions
    })
    return {
        meta:{
        page,
        limit,
        total
    }, 
    data:tours}
}
const getSingleByIdFromDB = async (user:IJWTPayload, tourId:string)=>{
    const tour = await prisma.tour.findUniqueOrThrow({
        where:{id: tourId},
        include: {
            guide: {
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

    if(!tour){
        throw new Error("Tour not found");
    }
    
    if(user.role === UserRole.ADMIN){
        return tour
    }
    if(user.role === UserRole.USER){
        return tour
    }
    
    if(user.role === UserRole.GUIDE && tour.guideId !== user.id){
        throw new Error("You are not authorized to view this booking");
    }
     
    return tour
}

const getMyTours = async (user: IJWTPayload) => {
    if(user.role !== UserRole.ADMIN && user.role !== UserRole.GUIDE){
        throw new Error("Only users can view their bookings");
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

const updateIntoDB = async (user:IJWTPayload, tourId:string, payload:any)=>{
    
    const existingBooking = await prisma.tour.findUniqueOrThrow({
        where:{id: tourId}
    })

    if(user.role === UserRole.USER ){
        throw new Error("Users are not allowed to update tour");
    }

    if(user.role === UserRole.GUIDE && existingBooking.guideId !== user.id){
        throw new Error("You are not authorized to update this tour");
    }
    // date chane or cancel booking logic
    const allowedFields = ["title", "description", "price", "durationHours", "maxPeople", "city", "meetingPoint", "categories", "images"];

    Object.keys(payload).forEach(key => {
            if (!allowedFields.includes(key)) {
                delete payload[key];
            }
        });

    if(Object.keys(payload).length === 0){
        throw new Error("No valid fields to update");
    }

    const updatedTour = await prisma.tour.update({
        where:{id: tourId},
        data:payload,
        include: {
        guide: true,
        images: true,
        categories: true
        }
    })
    
     
    return  updatedTour
}
const deleteFromDB = async (tourId:string)=>{
    const result = await prisma.tour.delete({
        where:{id: tourId}
    })
    return result   
    
}










export const TourService = {
    createTour,
    getAllFromDB,
    getSingleByIdFromDB,
    getMyTours,
    updateIntoDB,
    deleteFromDB
}