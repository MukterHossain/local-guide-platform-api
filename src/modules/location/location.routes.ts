import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { LocationController } from './location.controller';
import { LocationValidation } from './location.validation';


const router = express.Router();


router.get("/", 
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), 
    LocationController.getAllFromDB)

router.get("/:id",
    auth(UserRole.GUIDE, UserRole.ADMIN),
    LocationController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.ADMIN), 
    validateRequest(LocationValidation.createLocationSchema), 
    LocationController.inserIntoDB
    )
router.patch("/:id",
    auth(UserRole.ADMIN), 
    validateRequest(LocationValidation.updateLocaionSchema), 
    LocationController.updateIntoDB
    )
router.delete("/:id",
    auth(UserRole.ADMIN), LocationController.deleteFromDB
    )




export const LocationRoutes = router;