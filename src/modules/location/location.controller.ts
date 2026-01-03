import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import { LocationService } from "./location.service";
import { locationFilterableFields } from "./location.constant";


const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const {city, country} = req.body;
    const result = await LocationService.inserIntoDB(req.user!, city, country );
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
    
    const filters = pick(req.query, locationFilterableFields) 
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    // if(req.user?.role === 'GUIDE'){
    //     (filters as any).guideId = req.user.id
    // }
    const result = await LocationService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getAllGuideLocations = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
    
    const result = await LocationService.getAllGuideLocations(req.user as IJWTPayload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location fetched successfully",
        data: result
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {id} = req.params; 
  
    const result = await LocationService.getSingleByIdFromDB(req.user as IJWTPayload, id);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location fetched successfully",
        data: result
    })
})

const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const id = req.params.id;
  const {city, country}= req.body;
    const result = await LocationService.updateIntoDB(user as IJWTPayload , id, city, country);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const id = req.params.id;
    const result = await LocationService.deleteFromDB(id);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Location deleted successfully",
        data: null
    })
})









export const LocationController = {
    inserIntoDB,
    getAllFromDB,
    getAllGuideLocations,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}