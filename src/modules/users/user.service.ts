import { User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { IJWTPayload } from "../../types/common";

const createUser = async (req:Request): Promise<User> =>{
    
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
        }
    })
    console.log("user", result)
    return result
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
    getMyProfile
}