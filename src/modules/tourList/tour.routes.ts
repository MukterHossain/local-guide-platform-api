import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { TourController } from './tour.controller';
import { tourValidation } from './tour.validation';
import validateRequest from '../../middlewares/validateRequest';
import { fileUploader } from '../../helper/fileUploader';
import catchAsync from '../../shared/catchAsync';
import { IJWTPayload } from '../../types/common';
import sendResponse from '../../shared/sendResponse';
import { TourService } from './tour.service';
import httpStatus from 'http-status'

const router = express.Router();



router.get("/me",
    auth(UserRole.ADMIN, UserRole.GUIDE),
    TourController.getMyTours)
router.get("/:tourId",
    auth(UserRole.ADMIN, UserRole.GUIDE),
    TourController.getSingleByIdFromDB)

router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE), TourController.getAllFromDB)

// router.post("/",
//     auth(UserRole.GUIDE, UserRole.ADMIN),
//     fileUploader.upload.single('file'),
//     (req: Request, res: Response, next: NextFunction) => {
//         const parsedBody = tourValidation.tourCreateValidation.parse(JSON.parse(req.body.data))
//         req.body = parsedBody;
//         req.body.file = req.file;
//         return TourController.inserIntoDB(req, res, next)
//     }
// )


router.post(
  "/",
  auth(UserRole.GUIDE),
  fileUploader.upload.array("images", 5),
  catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
    let bodyData = req.body;
    if (typeof req.body.data === "string") {
      bodyData = JSON.parse(req.body.data);
    }

const result = await TourService.inserIntoDB(
      req.user!,
      bodyData,
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

// router.post(
//     "/",
//     auth(UserRole.GUIDE),
//     fileUploader.upload.array("images", 5), // multiple images
//     catchAsync(async (req: Request & { user?: IJWTPayload }, res: Response) => {
//         const files = req.files as Express.Multer.File[];
//         if (files && files.length > 0) {
//             const imageUrls = await fileUploader.uploadToCloudinary(files);
//             req.body.images = imageUrls; // multiple image URLs
//         }
//     })
// )

// router.post("/",
//     auth(UserRole.GUIDE, UserRole.ADMIN), 
//     validateRequest(tourValidation.tourCreateValidation), 
//     TourController.createTour
//     )
router.patch("/:tourId",
    auth(UserRole.GUIDE, UserRole.ADMIN),
    validateRequest(tourValidation.tourUpdateValidation), TourController.updateIntoDB
)
router.delete("/:tourId",
    auth(UserRole.GUIDE, UserRole.ADMIN), TourController.deleteFromDB
)




export const TourListRoutes = router;