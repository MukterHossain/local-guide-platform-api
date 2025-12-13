import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'
import pick from "../../helper/pick";
import { WishlistService } from "./wishlist.service";
import { wishlistFilterableFields } from "./wishlist.constant";

const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
        // const userId = req.user?.id
    const result = await WishlistService.inserIntoDB(req.user!, req.body);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    const filters = pick(req.query, wishlistFilterableFields)
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await WishlistService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {id} = req.params; 
  
    const result = await WishlistService.getSingleByIdFromDB(req.user as IJWTPayload, id);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist fetched successfully",
        data: result
    })
})

const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const id = req.params.id;
  const payload = req.body;
    const result = await WishlistService.updateIntoDB(user as IJWTPayload , id, payload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist updated successfully",
        data: result
    })
})

const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const id = req.params.id;
    const result = await WishlistService.deleteFromDB(id);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Wishlist deleted successfully",
        data: null
    })
})









export const WishlistController = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}