import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { LocationController } from './location.controller';
import { LocationValidation } from './location.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), LocationController.getAllFromDB)

router.get("/:locationId",
    auth(UserRole.GUIDE, UserRole.ADMIN),
    LocationController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.ADMIN), 
    validateRequest(LocationValidation.createLocationSchema), 
    LocationController.inserIntoDB
    )
router.patch("/:locationId",
    auth(UserRole.ADMIN), 
    validateRequest(LocationValidation.updateLocaionSchema), 
    LocationController.updateIntoDB
    )
router.delete("/:locationId",
    auth(UserRole.ADMIN), LocationController.deleteFromDB
    )




export const LocationRoutes = router;