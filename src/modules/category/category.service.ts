import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { categorySearchableFields } from "./category.constant";
// import { tourSearchableFields } from "./tour.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user:IJWTPayload, name: any)=>{
    if(user.role !== "ADMIN") {
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Admin can create categories");
    }

    const isExist = await prisma.category.findFirst({
        where:{
            name: name
        }
    })
    if(isExist){
        throw new ApiError(httpStatus.BAD_REQUEST,"Category already exists.");
    }
    const category = await prisma.category.create({
        data: {
            name: name
        }

    })
     
    return category
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.CategoryWhereInput[] = [];
    
        if (searchTerm) {
            andConditions.push({
                OR: categorySearchableFields.map(field => ({
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
    
        const whereConditions: Prisma.CategoryWhereInput = andConditions.length > 0 ? {
            AND: andConditions
        } : {}
    const categories = await prisma.category.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            tourCategories: true
        }
    })
    const total = await prisma.category.count({
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
const getSingleByIdFromDB = async (user:IJWTPayload, id:string)=>{
    const category = await prisma.category.findUniqueOrThrow({
        where:{id: id},
        
        include: {
            tourCategories: {
                include: {  
                    tour: true
                }
            }
        }
    })

    if(!category){
        throw new ApiError(httpStatus.NOT_FOUND,"Category not found");
    }
     
    return category
}



const updateIntoDB = async (user:IJWTPayload, id:string, payload:any)=>{
    
    if(user.role !== UserRole.ADMIN ){
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Admin is allowed to update category");
    }
    const existingBooking = await prisma.category.findUniqueOrThrow({
        where:{id: id}
    })

   if(!existingBooking){
    throw new ApiError(httpStatus.NOT_FOUND,"Category not found");
   }
    
    const allowedFields = ["name"];

    const filteredData = Object.fromEntries(
        Object.entries(payload).filter(([key]) => allowedFields.includes(key))
    )

    if(Object.keys(filteredData).length === 0){
        throw new ApiError(httpStatus.BAD_REQUEST,"No valid fields to update");
    }

    const updatedCategory = await prisma.category.update({
        where:{id: id},
        data:filteredData,
        include: {
            tourCategories: {
                include: {  
                    tour: true
                }
            }
        }
    })
    
     
    return  updatedCategory
}
const deleteFromDB = async (id:string)=>{
    const result = await prisma.category.delete({
        where:{id: id}
    })
    return result   
    
}










export const CategoryService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}