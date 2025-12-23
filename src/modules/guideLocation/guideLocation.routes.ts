import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { GuideLocationController } from './guideLocation.controller';
import { GuideLocationValidation } from './guideLocation.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), GuideLocationController.getAllFromDB)
router.get("/me", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), GuideLocationController.getMyGuideLocation)

router.get("/:id",
    auth(UserRole.GUIDE),
    GuideLocationController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.GUIDE), 
    validateRequest(GuideLocationValidation.createGuideLocationSchema), 
    GuideLocationController.inserIntoDB
    )
router.delete("/:id",
    auth(UserRole.GUIDE), GuideLocationController.deleteFromDB
    )




export const GuideLocationRoutes = router;