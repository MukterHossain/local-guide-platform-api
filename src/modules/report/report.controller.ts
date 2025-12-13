import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import pick from "../../helper/pick";
import { ReportService } from "./report.service";
import { reportFilterableFields } from "./report.constant";


const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const {reporterId, guideId, reason, details  } = req.body;
    const result = await ReportService.inserIntoDB(req.user!,  guideId, reason,  details);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    
    const filters = pick(req.query, reportFilterableFields) 
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await ReportService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {id} = req.params; 
  
    const result = await ReportService.getSingleByIdFromDB(req.user as IJWTPayload, id);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report fetched successfully",
        data: result
    })
})

const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const id = req.params.id;
  const {reason, details}= req.body;
    const result = await ReportService.updateIntoDB(user as IJWTPayload , id, reason, details);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const id = req.params.id;
    const result = await ReportService.deleteFromDB(id);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Report deleted successfully",
        data: null
    })
})









export const ReportController = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}