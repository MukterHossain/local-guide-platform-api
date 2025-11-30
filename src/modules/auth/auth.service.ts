import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import { Secret } from "jsonwebtoken"
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";
import { jwtHelper } from "../../helper/jwtHelper";


const login = async (payload: {email:string, password:string}) =>{
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                email: payload.email,
                status: UserStatus.ACTIVE
            }
        })
        const isCorrectPassword = await bcrypt.compare(payload.password, user.password);
        if(!isCorrectPassword){
            throw new ApiError(httpStatus.BAD_REQUEST,"Password is incorrect")
        }

        
        return {
            needPasswordChange:user.needPasswordChange,
            user
        }
}






export const AuthService = {
    login,
}