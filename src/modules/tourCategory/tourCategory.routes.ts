import express, { NextFunction, Request, Response } from 'express'
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { TourCategoryController } from './tourCategory.controller';
import { tourCategoryValidation } from './tourCategory.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), TourCategoryController.getAllFromDB)



router.post("/",
    auth(UserRole.ADMIN), 
    validateRequest(tourCategoryValidation.tourCategoryCreateValidation), 
    TourCategoryController.inserIntoDB
    )

router.delete("/:id",
    auth(UserRole.ADMIN), TourCategoryController.deleteFromDB
    )




export const TourCategoryRoutes = router;