import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import config from "../../config";


const login = catchAsync(async (req: Request, res: Response) => {

    const result = await AuthService.login(req.body)
    console.log("login")
    const { accessToken, refreshToken, needPasswordChange } = result;

    res.cookie('accessToken', accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24* 7 // 7 days
        // maxAge: accessTokenMaxAge
    })
    res.cookie('refreshToken', refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
        // maxAge: refreshTokenMaxAge
    })

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `${result.user?.role} login successfully`,
        data: {
            needPasswordChange: result.needPasswordChange
        }
    })
})





export const AuthController = {
    login,
}