import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { TourService } from "./tour.service";
import pick from "../../helper/pick";
import { tourFilterableFields } from "./tour.constant";

const createTour = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const result = await TourService.createTour(req.user!, req.body );
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    const filters = pick(req.query, tourFilterableFields)
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await TourService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {tourId} = req.params; 
  
    const result = await TourService.getSingleByIdFromDB(req.user as IJWTPayload, tourId);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours fetched successfully",
        data: result
    })
})
const getMyTours = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user 
    const result = await TourService.getMyTours(user as IJWTPayload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "My tours retrieved successfully",
        data: result
    })
})
const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const tourId = req.params.tourId;
  const payload = req.body;
    const result = await TourService.updateIntoDB(user as IJWTPayload , tourId, payload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const tourId = req.params.tourId;
    const result = await TourService.deleteFromDB(tourId);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour deleted successfully",
        data: null
    })
})









export const TourController = {
    createTour,
    getAllFromDB,
    getSingleByIdFromDB,
    getMyTours,
    updateIntoDB,
    deleteFromDB
}