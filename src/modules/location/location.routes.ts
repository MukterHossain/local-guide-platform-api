import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { LocationController } from './location.controller';
import { LocationValidation } from './location.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE), LocationController.getAllFromDB)

router.get("/:availabilityId",
    auth(UserRole.GUIDE, UserRole.ADMIN),
    LocationController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.ADMIN), 
    validateRequest(LocationValidation.createLocationSchema), 
    LocationController.inserIntoDB
    )
router.patch("/:availabilityId",
    auth(UserRole.GUIDE), 
    validateRequest(LocationValidation.updateLocaionSchema), 
    LocationController.updateIntoDB
    )
router.delete("/:categoryId",
    auth(UserRole.ADMIN), LocationController.deleteFromDB
    )




export const LocationRoutes = router;