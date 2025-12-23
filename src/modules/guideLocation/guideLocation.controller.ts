import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import { GuideLocationService } from "./guideLocation.service";
import { guideLocationFilterableFields } from "./guideLocation.constant";


const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const {locationId} = req.body;
    const result = await GuideLocationService.inserIntoDB(req.user!,locationId );
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "GuideLocation created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    
    const filters = pick(req.query, guideLocationFilterableFields) 
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await GuideLocationService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "GuideLocation fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getMyGuideLocation = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
    
    const filters = pick(req.query, guideLocationFilterableFields) 
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await GuideLocationService.getMyGuideLocation(filters, options, req.user as IJWTPayload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "GuideLocation fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {id} = req.params; 
  
    const result = await GuideLocationService.getSingleByIdFromDB(req.user as IJWTPayload, id);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "GuideLocation fetched successfully",
        data: result
    })
})


const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const id = req.params.id;
    const result = await GuideLocationService.deleteFromDB(id);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "GuideLocation deleted successfully",
        data: null
    })
})









export const GuideLocationController = {
    inserIntoDB,
    getAllFromDB,
    getMyGuideLocation,
    getSingleByIdFromDB,
    deleteFromDB
}