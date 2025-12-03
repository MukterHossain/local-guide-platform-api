import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { categorySearchableFields } from "./category.constant";
// import { tourSearchableFields } from "./tour.constant";

const inserIntoDB = async (user:IJWTPayload, name: any)=>{
    if(user.role !== "ADMIN") {
        throw new Error("Only Admin can create categories");
    }

    const isExist = await prisma.category.findFirst({
        where:{
            name: name
        }
    })
    if(isExist){
        throw new Error("Category already exists.");
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
const getSingleByIdFromDB = async (user:IJWTPayload, categoryId:string)=>{
    const category = await prisma.category.findUniqueOrThrow({
        where:{id: categoryId},
        
        include: {
            tourCategories: {
                include: {  
                    tour: true
                }
            }
        }
    })

    if(!category){
        throw new Error("Category not found");
    }
     
    return category
}



const updateIntoDB = async (user:IJWTPayload, categoryId:string, payload:any)=>{
    
    if(user.role !== UserRole.ADMIN ){
        throw new Error("Only Admin is allowed to update category");
    }
    const existingBooking = await prisma.category.findUniqueOrThrow({
        where:{id: categoryId}
    })

   if(!existingBooking){
    throw new Error("Category not found");
   }
    
    const allowedFields = ["name"];

    const filteredData = Object.fromEntries(
        Object.entries(payload).filter(([key]) => allowedFields.includes(key))
    )

    if(Object.keys(filteredData).length === 0){
        throw new Error("No valid fields to update");
    }

    const updatedCategory = await prisma.category.update({
        where:{id: categoryId},
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
const deleteFromDB = async (categoryId:string)=>{
    const result = await prisma.category.delete({
        where:{id: categoryId}
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