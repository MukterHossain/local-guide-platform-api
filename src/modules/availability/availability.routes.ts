import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { AvailabilityController } from './availability.controller';
import { AvailabelityValidation } from './availability.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE), AvailabilityController.getAllFromDB)

router.get("/:availabilityId",
    auth(UserRole.GUIDE, UserRole.ADMIN),
    AvailabilityController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.GUIDE), 
    validateRequest(AvailabelityValidation.createAvailabilitySchema), 
    AvailabilityController.inserIntoDB
    )
router.patch("/:availabilityId",
    auth(UserRole.GUIDE), 
    validateRequest(AvailabelityValidation.updateAvailabilitySchema), 
    AvailabilityController.updateIntoDB
    )
router.delete("/:categoryId",
    auth(UserRole.ADMIN), AvailabilityController.deleteFromDB
    )




export const AvailabilityRoutes = router;