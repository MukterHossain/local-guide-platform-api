import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'

const createUser = catchAsync (async (req:Request, res:Response) =>{
    const result = await UserService.createUser(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User created successfully",
        data: result
    })
})
const getMyProfile = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
    const user = req.user;
    const result = await UserService.getMyProfile(user as IJWTPayload)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: result
    })
})


export const UserController = {
    createUser,
    getMyProfile
}