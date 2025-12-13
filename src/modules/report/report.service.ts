import { Prisma, UserRole} from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
import { reportSearchableFields } from "./report.constant";
const inserIntoDB = async (user:IJWTPayload, guideId: string, reason: string, details?: string)=>{
    if(user.role !== UserRole.TOURIST) {
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only users can report guides.")
    }

    const isExist = await prisma.report.findFirst({
        where:{
            guideId: guideId
        }
    })
    if(isExist){
        throw new ApiError(httpStatus.BAD_REQUEST,"Report already exists.");
    }
    const result = await prisma.report.create({
        data: {
            reporterId: user.id, 
            guideId, 
            reason, 
            details
        }

    })
     
    return result
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.ReportWhereInput[] = [];
    
        if (searchTerm) {
            andConditions.push({
                OR: reportSearchableFields.map(field => ({
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
    
        const whereConditions: Prisma.ReportWhereInput = andConditions.length > 0 ? {
            AND: andConditions
        } : {}
    const findData = await prisma.report.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        include: {
            guide: true,
            reporter: true
            
        }
    })
    const total = await prisma.report.count({
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
    if(user.role !== UserRole.TOURIST && user.role !== UserRole.ADMIN){
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only the Tourist or Admin can access report details");
    }
    const result = await prisma.report.findUniqueOrThrow({
        where:{id: id},
        
        include: {
            guide: true,
            reporter: true
        }
    })

    if(!result){
        throw new ApiError(httpStatus.NOT_FOUND,"Report not found");
    }
     
    return result
}



const updateIntoDB = async (user:IJWTPayload, id:string, reason:string, details?:string)=>{
    const exists = await prisma.report.findUniqueOrThrow({ where: { id: id } });
    
    if(user.role !== UserRole.ADMIN ){
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only the Admin can update report");
    }

    if(!exists){
        throw new ApiError(httpStatus.NOT_FOUND,"Report not found");
    }
    
    
    const allowedFields = ["reason", "details"];

    const filteredData = Object.fromEntries(
        Object.entries( {reason, details}).filter(([key]) => allowedFields.includes(key))
    )

    if(Object.keys(filteredData).length === 0){
        throw new ApiError(httpStatus.BAD_REQUEST,"No valid fields to update");
    }

    const updateData = await prisma.report.update({
        where:{id: id},
        data:filteredData,
        include: {
            guide: true,
            reporter: true
        }
    })
    
     
    return  updateData
}
const deleteFromDB = async (id:string)=>{
    const result = await prisma.report.delete({
        where:{id: id}
    })
    return result   
    
}










export const ReportService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}