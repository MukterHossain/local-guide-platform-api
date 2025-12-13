import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import validateRequest from '../../middlewares/validateRequest';
import { ReportController } from './report.controller';
import { ReportValidation } from './report.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.TOURIST), ReportController.getAllFromDB)

router.get("/:id",
    auth(UserRole.TOURIST, UserRole.ADMIN),
    ReportController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.TOURIST), 
    validateRequest(ReportValidation.createReport), 
    ReportController.inserIntoDB
    )
router.patch("/:id",
    auth(UserRole.ADMIN), 
    validateRequest(ReportValidation.updateReport), 
    ReportController.updateIntoDB
    )
router.delete("/:id",
    auth(UserRole.ADMIN), ReportController.deleteFromDB
    )




export const ReportRoutes = router;