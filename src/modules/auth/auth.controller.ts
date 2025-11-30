import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from "http-status";
import sendResponse from "../../shared/sendResponse";
import { AuthService } from "./auth.service";


const login = catchAsync(async (req: Request, res: Response) => {

    console.log("login")

    // sendResponse(res, {
    //     statusCode: 201,
    //     success: true,
    //     message: `${result.user?.role} login successfully`,
    //     data: {
    //         needPasswordChange: result.needPasswordChange
    //     }
    // })
})





export const AuthController = {
    login,
}