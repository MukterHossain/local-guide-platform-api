import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { TourCategoryService } from "./tourCategory.service";
import pick from "../../helper/pick";


const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const tourId = req.body.tourId;
    const categoryId = req.body.categoryId;
    const result = await TourCategoryService.inserIntoDB(req.user!, tourId, categoryId );
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour Category created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
     const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
    const tourId = req.query.tourId as string;

    const result = await TourCategoryService.getAllFromDB({tourId} , options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category fetched successfully",
        meta: result.meta,
        data: result.data
    })
})


const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const tourCategoryId = req.params.tourCategoryId;
    const result = await TourCategoryService.deleteFromDB(tourCategoryId);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour Category deleted successfully",
        data: null
    })
})









export const TourCategoryController = {
    inserIntoDB,
    getAllFromDB,
    deleteFromDB
}