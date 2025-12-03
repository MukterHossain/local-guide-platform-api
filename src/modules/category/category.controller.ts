import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";

import httpStatus from 'http-status'
import sendResponse from "../../shared/sendResponse";
import { IJWTPayload } from "../../types/common";

import pick from "../../helper/pick";
import { CategoryService } from "./category.service";
import { categoryFilterableFields } from "./category.constant";


const inserIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload } , res:Response) =>{
    const {name} = req.body;
    const result = await CategoryService.inserIntoDB(req.user!, name );
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category created successfully",
        data: result
    })
})

const getAllFromDB = catchAsync (async (req:Request, res:Response) =>{
    
    const filters = pick(req.query, categoryFilterableFields) // change korte hobe
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])

    const result = await CategoryService.getAllFromDB(filters, options);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category fetched successfully",
        meta: result.meta,
        data: result.data
    })
})
const getSingleByIdFromDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
   const {categoryId} = req.params; 
  
    const result = await CategoryService.getSingleByIdFromDB(req.user as IJWTPayload, categoryId);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category fetched successfully",
        data: result
    })
})

const updateIntoDB = catchAsync (async (req:Request & { user?: IJWTPayload }, res:Response) =>{
  const user = req.user  
  const categoryId = req.params.categoryId;
  const payload = req.body;
    const result = await CategoryService.updateIntoDB(user as IJWTPayload , categoryId, payload);
    console.log("result", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category updated successfully",
        data: result
    })
})
const deleteFromDB = catchAsync (async (req:Request , res:Response) =>{
  const categoryId = req.params.categoryId;
    const result = await CategoryService.deleteFromDB(categoryId);
    console.log("result delete", result);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category deleted successfully",
        data: null
    })
})









export const CategoryController = {
    inserIntoDB,
    getAllFromDB,
    getSingleByIdFromDB,
    updateIntoDB,
    deleteFromDB
}