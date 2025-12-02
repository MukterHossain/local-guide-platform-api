import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { TourService } from "./tour.service";

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









export const TourController = {
    createTour
}