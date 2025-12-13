import { Prisma } from "@prisma/client";

import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";

const inserIntoDB = async (user:IJWTPayload, tourId:string, categoryId:string)=>{
    if(user.role !== "ADMIN") {
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Admin can create tour categories");
    }

    const isExist = await prisma.tourCategory.findFirst({
        where:{
            tourId: tourId,
            categoryId: categoryId
        }
    })
    if(isExist){
        throw new ApiError(httpStatus.BAD_REQUEST,"Tour Category already exists.");
    }
    const tourCategory = await prisma.tourCategory.create({
        data: {
            tourId: tourId,
            categoryId: categoryId
        }

    })
     
    return tourCategory
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    
    
    const tourCategories = await prisma.tourCategory.findMany({
        where: {
            tourId: params.tourId
        },
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            tour: true,
            category: true
        }
    })
    const total = await prisma.tourCategory.count({
        where: {
            tourId: params.tourId
        }
    })
    return {
        meta:{
        page,
        limit,
        total
    }, 
    data:tourCategories}
}




const deleteFromDB = async (id:string)=>{
    const result = await prisma.tourCategory.delete({
        where:{id: id}
    })
    return result   
    
}










export const TourCategoryService = {
    inserIntoDB,
    getAllFromDB,
    deleteFromDB
}