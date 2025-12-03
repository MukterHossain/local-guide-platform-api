import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import { AvailabilityService } from "./availability.service";
import { availabilityFilterableFields } from "./availability.constant";


const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const {startAt, endAt} = req.body;
    const result = await AvailabilityService.inserIntoDB(req.user!, new Date(startAt),
    new Date(endAt) );
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availability created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    
    const filters = pick(req.query, availabilityFilterableFields) 
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await AvailabilityService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availability fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {availabilityId} = req.params; 
  
    const result = await AvailabilityService.getSingleByIdFromDB(req.user as IJWTPayload, availabilityId);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availability fetched successfully",
        data: result
    })
})

const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const availabilityId = req.params.availabilityId;
  const {startAt, endAt}= req.body;
    const result = await AvailabilityService.updateIntoDB(user as IJWTPayload , availabilityId, new Date(startAt), new Date(endAt));
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Availability updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const categoryId = req.params.categoryId;
    const result = await AvailabilityService.deleteFromDB(categoryId);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category deleted successfully",
        data: null
    })
})









export const AvailabilityController = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}