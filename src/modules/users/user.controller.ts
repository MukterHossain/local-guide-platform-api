import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'
import { userFilterableFields } from "./user.constant";
import pick from "../../helper/pick";

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
const createAdmin = catchAsync (async (req:Request, res:Response) =>{
    const result = await UserService.createAdmin(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Admin created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request , res:Response) =>{
     const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await UserService.getAllFromDB(filters, options)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: result.data,
        meta: result.meta
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
    createAdmin,
    getAllFromDB,
    getMyProfile
}