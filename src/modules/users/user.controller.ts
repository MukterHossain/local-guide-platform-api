import { Request, Response } from "express";
import { UserService } from "./user.service";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";


const createUser = catchAsync (async (req:Request, res:Response) =>{
    const result = await UserService.createUser(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User created successfully",
        data: result
    })
})


export const UserController = {
    createUser
}