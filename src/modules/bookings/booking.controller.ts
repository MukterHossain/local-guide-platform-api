import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { BookingService } from "./booking.service";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";

const createBooking = catchAsync (async (req:Request , res:Response) =>{
    
    const result = await BookingService.createBooking(req)
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: result
    })
})









export const BookingController = {
    createBooking
}