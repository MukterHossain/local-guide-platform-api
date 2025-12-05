import { Prisma, UserRole} from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { locationSearchableFields } from "../location/location.constant";
import httpStatus from "http-status";
import ApiError from "../../error/ApiError";
const inserIntoDB = async (user:IJWTPayload,guideId: string, locationId: string )=>{
    if(user.role !== UserRole.GUIDE) {
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Guide can create location");
    }

    const isExist = await prisma.guideLocation.findFirst({
        where:{
            guideId: guideId,
            locationId: locationId
        }
    })
    if(isExist){
        throw new ApiError(httpStatus.BAD_REQUEST,"Guide Location already exists.");
    }
    const createData = await prisma.guideLocation.create({
        data: {
            guideId: guideId,
            locationId: locationId
        }

    })
     
    return createData
}

const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)

    const { searchTerm, ...filterData } = params;

    const andConditions: Prisma.GuideLocationWhereInput[] = [];
    
        if (searchTerm) {
            andConditions.push({
                 OR: [
                { location: { city: { contains: searchTerm, mode: "insensitive" } } },
                { location: { country: { contains: searchTerm, mode: "insensitive" } } },
            ]
            })
        }
    
        if (Object.keys(filterData).length > 0) {
            const filterConditions: Prisma.GuideLocationWhereInput[] = [];

            Object.keys(filterData).forEach(key => {
            if (key === "location.city") {
                filterConditions.push({ location: { city: { equals: filterData[key] } } });
            } else if (key === "location.country") {
                filterConditions.push({ location: { country: { equals: filterData[key] } } });
            } else {
                filterConditions.push({ [key]: { equals: filterData[key] } });
            }
        });

            andConditions.push({
                AND: filterConditions
            });
        }
    
        const whereConditions: Prisma.GuideLocationWhereInput = andConditions.length > 0 ? {
            AND: andConditions
        } : {}
    const findData = await prisma.guideLocation.findMany({
        where: whereConditions,
        skip: skip,
        take: Number(limit),
        orderBy: sortBy ?  {
            [sortBy]: sortOrder
        }: {id: "desc"},
        include: {
            guide: true,
            location: true
            
        }
    })
    const total = await prisma.guideLocation.count({
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
const getSingleByIdFromDB = async (user:IJWTPayload, guideLocationId:string)=>{
    if(user.role !== UserRole.GUIDE){
        throw new ApiError(httpStatus.UNAUTHORIZED,"Only Guide  is allowed to access guideLocation details");
    }
    const getData = await prisma.guideLocation.findUniqueOrThrow({
        where:{id: guideLocationId},
        
        include: {
            guide: true,
            location: true
        }
    })

    if(!getData){
        throw new ApiError(httpStatus.NOT_FOUND,"GuideLocation not found");
    }
     
    return getData
}




const deleteFromDB = async (guideLocationId:string)=>{
    const result = await prisma.guideLocation.delete({
        where:{id: guideLocationId}
    })
    return result   
    
}










export const GuideLocationService = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    deleteFromDB
}