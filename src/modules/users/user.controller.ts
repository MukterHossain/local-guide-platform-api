import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'
import { userFilterableFields } from "./user.constant";
import pick from "../../helper/pick";
import { fileUploader } from "../../helper/fileUploader";

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
const getGuidesAllFromDB = catchAsync (async (req:Request , res:Response) =>{
     const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await UserService.getGuidesAllFromDB(filters, options)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User guides retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})
const getTouristsAllFromDB = catchAsync (async (req:Request , res:Response) =>{
     const filters = pick(req.query, userFilterableFields) // searching , filtering
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]) // pagination and sorting

    const result = await UserService.getTouristsAllFromDB(filters, options)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User tourists retrieved successfully",
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
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
    const {id }= req.params;

    const result = await UserService.getSingleByIdFromDB(req.user as IJWTPayload ,id)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User  retrieved successfully",
        data: result
    })
})
const updateMyProfie = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{

    const result = await UserService.updateMyProfie(req.user!, req)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: result
    })
})
const changeUserStatus = catchAsync (async (req:Request , res:Response) =>{
   const id = req.params.id;
    const result = await UserService.changeUserStatus(id, req.body)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User status updated successfully",
        data: result
    })
})


export const UserController = {
    createUser,
    createAdmin,
    getAllFromDB,
    getGuidesAllFromDB,
    getTouristsAllFromDB,
    getMyProfile,
    getSingleByIdFromDB,
    updateMyProfie,
    changeUserStatus
}