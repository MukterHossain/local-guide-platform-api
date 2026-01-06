import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import { TourService } from "./tour.service";
import pick from "../../helper/pick";
import { tourFilterableFields } from "./tour.constant";
import { fileUploader } from "../../helper/fileUploader";
import ApiError from "../../error/ApiError";
import { tourUpdateValidation } from "./tour.validation";

const inserIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const result = await TourService.inserIntoDB(req.user!, req.body, req.files as Express.Multer.File[]);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const filters = pick(req.query, tourFilterableFields)
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await TourService.getAllFromDB(filters, options, req.user as IJWTPayload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours fetched successfully",
        meta: result.meta,
        data: result.data ?? []
    })
})
const getTourListforPublic = catchAsync(async (req: Request , res: Response) => {
  
    const filters = pick(req.query, tourFilterableFields)
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await TourService.getTourListforPublic(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Public tours fetched successfully",
        meta: result.meta,
        data: result.data ?? []
    })
})
const getSingleByIdFromDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const { id } = req.params;

    const result = await TourService.getSingleByIdFromDB(req.user as IJWTPayload, id);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours fetched successfully",
        data: result
    })
})
const getPublicById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await TourService.getPublicById(id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours by id fetched successfully",
        data: result
    })
})
const getMyTours = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
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
const updateIntoDB = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user
    const id = req.params.id;

    let payload: any = req.body;
    if (typeof req.body.data === "string") {
        payload = JSON.parse(req.body.data);
    }

    const validation = tourUpdateValidation.safeParse(payload);
    if (!validation.success) {
        throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Validation failed",
            JSON.stringify(validation.error.flatten())
        );
    }

    payload = validation.data;
    // image upload
    const files = req.files as Express.Multer.File[] | undefined;
    let uploadedImages: string[] = [];

    if (files && files?.length > 0) {
        const result = await fileUploader.uploadToCloudinary(files);
        uploadedImages = Array.isArray(result) ? result : [result];
    }


    if (payload?.images.length || uploadedImages.length) {
        payload.images = [...(payload.images ?? []), ...uploadedImages];
    }
    else {
        payload.images = undefined;
    }


    const result = await TourService.updateIntoDB(user as IJWTPayload, id, payload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour updated successfully",
        data: result
    })
})
const changeTourListStatus = catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const id = req.params.id;
    const { status } = req.body;

    const result = await TourService.changeTourListStatus(id, status);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour status updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await TourService.deleteFromDB(id);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour deleted successfully",
        data: null
    })
})









export const TourController = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    getTourListforPublic,
    getPublicById,
    getMyTours,
    updateIntoDB,
    changeTourListStatus,
    deleteFromDB
}