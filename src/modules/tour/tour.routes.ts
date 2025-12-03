import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { TourController } from './tour.controller';
import { tourValidation } from './tour.validation';
import validateRequest from '../../middlewares/validateRequest';


const router = express.Router();



router.get("/me",
    auth(UserRole.ADMIN , UserRole.GUIDE),
    TourController.getMyTours)
router.get("/:tourId",
    auth(UserRole.ADMIN, UserRole.GUIDE),
    TourController.getSingleByIdFromDB)

router.get("/", auth(UserRole.ADMIN), TourController.getAllFromDB)



router.post("/",
    auth(UserRole.GUIDE, UserRole.ADMIN), 
    validateRequest(tourValidation.tourCreateValidation), 
    TourController.createTour
    )
router.patch("/:tourId",
    auth(UserRole.GUIDE, UserRole.ADMIN), 
    validateRequest(tourValidation.tourUpdateValidation), TourController.updateIntoDB
    )
router.delete("/:tourId",
    auth(UserRole.GUIDE, UserRole.ADMIN), TourController.deleteFromDB
    )




export const TourRoutes = router;