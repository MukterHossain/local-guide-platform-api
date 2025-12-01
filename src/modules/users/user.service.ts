import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { IJWTPayload } from "../../types/common";
import { fileUploader } from "../../helper/fileUploader";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { userSearchableFields } from "./user.constant";

const createUser = async (req:Request): Promise<User> =>{
    
     if (req.file) {
        const uploadResult = await fileUploader.uploadToCloudinary(req.file)
        console.log("uploadResult", uploadResult);
        req.body.image = uploadResult?.secure_url
    }
 const hasshedPassword = await bcrypt.hash(req.body.password, 10);
    if(req.body.role === UserRole.ADMIN){
        throw new Error("Admin already exist")
     }
    const result = await prisma.user.create({
        data: {
            email: req.body.email,
            password: hasshedPassword,
            name: req.body.name,
            phone: req.body.phone,
            role: req.body.role as UserRole || UserRole.USER,
            address: req.body.address,
            image: req.body.image
        }
    })
    console.log("user", result)
    return result
}


const getAllFromDB =async(params:any, options: IOptions)=>{
 
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(options)
    const { searchTerm, ...filterData } = params;

     const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: userSearchableFields.map(field => ({
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

    const whereConditions: Prisma.UserWhereInput = andConditions.length > 0 ? {
        AND: andConditions
    } : {}
    const total = await prisma.user.count({
        where: whereConditions
    })
    const result = await prisma.user.findMany({
        skip,
        take: Number(limit),
        orderBy: {
            [sortBy]: sortOrder
        },
        where: {
            AND: andConditions
        },
        
    })

    return {
        meta: {
            total,
            page,
            limit
        },
        data: result
    }
}

const getMyProfile = async (user: IJWTPayload) =>{
    const userInfo = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            needPasswordChange: true,
            role: true,
            status: true
        }
    })
    let profileData;
    if(userInfo.role === UserRole.USER){
        profileData = await prisma.user.findUniqueOrThrow({
            where:{
                email: user.email,
                status: UserStatus.ACTIVE
            }
        })
    }
    if(userInfo.role === UserRole.GUIDE){
        profileData = await prisma.profile.findUniqueOrThrow({
            where:{
                userId: userInfo.id
            }
        })
    }
    if(userInfo.role === UserRole.ADMIN){
        profileData = await prisma.user.findUniqueOrThrow({
            where:{
                email: user.email
            }
        })
    }
    return {
        ...userInfo,
        ...profileData
    }
}







export const UserService = {
    createUser,
    getAllFromDB,
    getMyProfile
}