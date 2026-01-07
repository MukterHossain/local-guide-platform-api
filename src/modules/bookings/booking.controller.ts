import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { BookingService } from "./booking.service";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { userFilterableFields } from "../users/user.constant";
import pick from "../../helper/pick";
import { bookingFilterableFields } from "./booking.constant";

const createBooking = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const { tourId, bookingDate } = req.body;
    const result = await BookingService.createBooking(req.user!, tourId, new Date(bookingDate));
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking created successfully",
        data: result
    })
})
const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    const filters = pick(req.query, userFilterableFields)
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await BookingService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking created successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {id} = req.params; 
  
    const result = await BookingService.getSingleByIdFromDB(req.user as IJWTPayload, id);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking fetched successfully",
        data: result
    })
})
const getMyBooking = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const filters = pick(req.query, bookingFilterableFields) 
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const user = req.user 
    const result = await BookingService.getMyBooking(user as IJWTPayload, filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My bookings retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})
const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const id = req.params.id;
  const payload = req.body;
    const result = await BookingService.updateIntoDB(user as IJWTPayload , id, payload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking updated successfully",
        data: result
    })
})
const updateBookingStatus = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const id = req.params.id;
  const {status} = req.body;
    const result = await BookingService.updateBookingStatus(user as IJWTPayload , id, status);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const id = req.params.id;
    const result = await BookingService.deleteFromDB(id);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Booking deleted successfully",
        data: null
    })
})









export const BookingController = {
    createBooking,
    getAllFromDB,
    getSingleByIdFromDB,
    getMyBooking,
    updateIntoDB,
    updateBookingStatus,
    deleteFromDB
}