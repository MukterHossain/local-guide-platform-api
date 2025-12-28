import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { TourController } from './tour.controller';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../helper/fileUploader';
import catchAsync from '../../shared/catchAsync';
import { IJWTPayload } from '../../types/common';
import sendResponse from '../../shared/sendResponse';
import { TourService } from './tour.service';
import httpStatus from 'http-status'
import { tourCreateValidation, tourUpdateValidation } from './tour.validation';
import ApiError from '../../error/ApiError';

const router = express.Router();



router.get("/me",
    auth(UserRole.ADMIN, UserRole.GUIDE),
    TourController.getMyTours)
router.get("/:id",
    auth(UserRole.ADMIN, UserRole.GUIDE , UserRole.TOURIST),
    TourController.getSingleByIdFromDB)
router.get("/public/:id",
    // auth(UserRole.ADMIN, UserRole.GUIDE , UserRole.TOURIST),
    TourController.getPublicById)

router.get("/", 
  // auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), 
  TourController.getAllFromDB)

router.post(
  "/",
  auth(UserRole.GUIDE),
  fileUploader.upload.array("images", 5),
  catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    let bodyData = req.body;
    if (typeof req.body.data === "string") {
      bodyData = JSON.parse(req.body.data);
    }

    const validation = tourCreateValidation.safeParse(bodyData);
    if(!validation.success){
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Validation failed",
        JSON.stringify(validation.error.flatten())
      );
    }

const result = await TourService.inserIntoDB(
      req.user!,
      validation.data,
      req.files as Express.Multer.File[]
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tour created successfully",
      data: result
    });
  })
);


router.patch("/:id",
    auth(UserRole.GUIDE, UserRole.ADMIN),
    fileUploader.upload.array("images", 5),
     TourController.updateIntoDB
)
router.delete("/:id",
    auth(UserRole.GUIDE, UserRole.ADMIN), TourController.deleteFromDB
)




export const TourListRoutes = router;