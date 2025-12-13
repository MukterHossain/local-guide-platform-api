import { Prisma, UserRole} from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { locationSearchableFields } from "./location.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user:IJWTPayload, city: string, country: string)=>{
    if(user.role !== UserRole.ADMIN) {
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Admin can create location");
    }

    const isExist = await prisma.location.findFirst({
        where:{
            city: city,
            country: country
        }
    })
    if(isExist){
        throw new ApiError(httpStatus.BAD_REQUEST,"Location already exists.");
    }
    const location = await prisma.location.create({
        data: {
            city: city,
            country: country
        }

    })
     
    return location
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.LocationWhereInput[] = [];
    
        if (searchTerm) {
            andConditions.push({
                OR: locationSearchableFields.map(field => ({
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
    
        const whereConditions: Prisma.LocationWhereInput = andConditions.length > 0 ? {
            AND: andConditions
        } : {}
    const findData = await prisma.location.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            guideLocations: true,
            profiles: true
            
        }
    })
    const total = await prisma.location.count({
        where: whereConditions
    })
    return {
        meta:{
        page,
        limit,
        total
    }, 
    data:findData
}
}
const getSingleByIdFromDB = async (user:IJWTPayload, id:string)=>{
    if(user.role !== UserRole.GUIDE && user.role !== UserRole.ADMIN){
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Guide or Admin is allowed to access location details");
    }
    const location = await prisma.location.findUniqueOrThrow({
        where:{id: id},
        
        include: {
            guideLocations: true,
            profiles: true
        }
    })

    if(!location){
        throw new ApiError(httpStatus.NOT_FOUND,"Location not found");
    }
     
    return location
}



const updateIntoDB = async (user:IJWTPayload, id:string, city:string, country:string)=>{
    const exists = await prisma.location.findUniqueOrThrow({ where: { id: id } });
    
    if(user.role !== UserRole.ADMIN ){
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only the Admin can update location");
    }

    if(!exists){
        throw new ApiError(httpStatus.NOT_FOUND,"Location not found")
    }
    
    
    const allowedFields = ["city", "country"];

    const filteredData = Object.fromEntries(
        Object.entries( {city, country}).filter(([key]) => allowedFields.includes(key))
    )

    if(Object.keys(filteredData).length === 0){
        throw new ApiError(httpStatus.BAD_REQUEST,"No valid fields to update");
    }

    const updateData = await prisma.location.update({
        where:{id: id},
        data:filteredData,
        include: {
            guideLocations: true,
            profiles: true
        }
    })
    
     
    return  updateData
}
const deleteFromDB = async (id:string)=>{
    const result = await prisma.location.delete({
        where:{id: id}
    })
    return result   
    
}










export const LocationService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}