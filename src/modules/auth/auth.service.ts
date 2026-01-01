import { prisma } from "../../shared/prisma";
import bcrypt from "bcryptjs";
import { UserStatus } from "@prisma/client";
import { Secret } from "jsonwebtoken"
import ApiError from "../../error/ApiError";
import httpStatus from "http-status";
import { jwtHelper } from "../../helper/jwtHelper";
import config from "../../config";


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

        const jwtPayload = {
            id:user.id,
            email:user.email,
            role:user.role
        }


         const accessToken = jwtHelper.generateToken(jwtPayload, config.jwt.jwt_secret as Secret, config.jwt.expires_in as string)
        //  const accessToken = jwtHelper.generateToken({email:user.email, role:user.role}, config.jwt.jwt_secret as Secret, config.jwt.expires_in as string)

       
        const refreshToken =jwtHelper.generateToken(jwtPayload, config.jwt.refresh_token_secret as Secret, config.jwt.refresh_token_expires_in as string)


        
        return {
            accessToken,
            refreshToken,
            needPasswordChange:user.needPasswordChange,
            user
        }
}


const refreshToken = async (token: string) => {
    let decodedData;
    try {
        decodedData = jwtHelper.verifyToken(token, config.jwt.refresh_token_secret as Secret);
    }
    catch (err) {
        throw new Error("You are not authorized!")
    }

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        }
    });
//JwtHelper
    const accessToken = jwtHelper.generateToken({
        email: userData.email,
        role: userData.role
    },
        config.jwt.jwt_secret as Secret,
        config.jwt.expires_in as string
    );
     const refreshToken = jwtHelper.generateToken({
        email: userData.email,
        role: userData.role
    },
        config.jwt.refresh_token_secret as Secret,
        config.jwt.refresh_token_expires_in as string
    );

    return {
        accessToken,
        refreshToken,
        needPasswordChange: userData.needPasswordChange
    };

};


const changePassword = async (user: any, payload: any) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user.email,
            status: UserStatus.ACTIVE
        }
    });

    const isCorrectPassword: boolean = await bcrypt.compare(payload.oldPassword, userData.password);

    if (!isCorrectPassword) {
  throw new ApiError(httpStatus.BAD_REQUEST, "Old password is incorrect");
}

    const hashedPassword: string = await bcrypt.hash(payload.newPassword, Number(config.salt_round));

    await prisma.user.update({
        where: {
            email: userData.email
        },
        data: {
            password: hashedPassword,
            needPasswordChange: false
        }
    })

    return {
        message: "Password changed successfully!"
    }
};

const getMe = async (user: any) => {
    const accessToken = user.accessToken;
    const decodedData = jwtHelper.verifyToken(accessToken, config.jwt.jwt_secret as Secret);

    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: decodedData.email,
            status: UserStatus.ACTIVE
        },
        select: {
            id: true,
            email: true,
            role: true,
            needPasswordChange: true,
            status: true,
            name: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return userData;
}





export const AuthService = {
    login,
    refreshToken,
    changePassword,
    getMe
}