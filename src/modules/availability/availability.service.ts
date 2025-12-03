import { Prisma, UserRole} from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { availabilitySearchableFields } from "./availability.constant";

const inserIntoDB = async (user:IJWTPayload, startAt: Date, endAt: Date)=>{
    if(user.role !== UserRole.GUIDE) {
        throw new Error("Only Guide can create availability");
    }
 if(startAt >= endAt){
    throw new Error("End time must be after start time");
 }
    const isExist = await prisma.availability.findFirst({
        where:{
            startAt: startAt,
            endAt: endAt
        }
    })
    if(isExist){
        throw new Error("Availability already exists.");
    }
    const availability = await prisma.availability.create({
        data: {
            guideId: user.id,
            startAt: startAt,
            endAt: endAt
        }

    })
     
    return availability
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
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
        meta:{
        page,
        limit,
        total
    }, 
    data:categories}
}
const getSingleByIdFromDB = async (user:IJWTPayload, availabilityId:string)=>{
    if(user.role !== UserRole.GUIDE && user.role !== UserRole.ADMIN){
        throw new Error("Only Guide or Admin is allowed to access availability details");
    }
    const availability = await prisma.availability.findUniqueOrThrow({
        where:{id: availabilityId},
        
        include: {
            guide: true
        }
    })

    if(!availability){
        throw new Error("Availability not found");
    }
     
    return availability
}



const updateIntoDB = async (user:IJWTPayload, availabilityId:string, startAt: Date, endAt: Date)=>{
    const avail = await prisma.availability.findUniqueOrThrow({ where: { id: availabilityId } });
    
    if(user.role !== UserRole.GUIDE || avail.guideId !== user.id){
        throw new Error("Only the guide can update availability");
    }
    
    
    const allowedFields = ["startAt", "endAt"];

    const filteredData = Object.fromEntries(
        Object.entries( {startAt, endAt}).filter(([key]) => allowedFields.includes(key))
    )

    if(Object.keys(filteredData).length === 0){
        throw new Error("No valid fields to update");
    }

    const updateData = await prisma.availability.update({
        where:{id: availabilityId},
        data:filteredData,
        include: {
            guide: true
        }
    })
    
     
    return  updateData
}
const deleteFromDB = async (categoryId:string)=>{
    const result = await prisma.category.delete({
        where:{id: categoryId}
    })
    return result   
    
}










export const AvailabilityService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}