import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';


const router = express.Router();






router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), CategoryController.getAllFromDB)

router.get("/:id",
    auth(UserRole.ADMIN),
    CategoryController.getSingleByIdFromDB
)

router.post("/",
    auth(UserRole.ADMIN), 
    validateRequest(CategoryValidation.categoryCreateValidation), 
    CategoryController.inserIntoDB
    )
router.patch("/:id",
    auth(UserRole.ADMIN), 
    validateRequest(CategoryValidation.categoryUpdateValidation), 
    CategoryController.updateIntoDB
    )
router.delete("/:id",
    auth(UserRole.ADMIN), CategoryController.deleteFromDB
    )




export const CategoryRoutes = router;