import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';


const router = express.Router();




router.get("/:categoryId",
    auth(UserRole.ADMIN),
    CategoryController.getSingleByIdFromDB)

router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.USER), CategoryController.getAllFromDB)



router.post("/",
    auth(UserRole.ADMIN), 
    validateRequest(CategoryValidation.categoryCreateValidation), 
    CategoryController.inserIntoDB
    )
router.patch("/:categoryId",
    auth(UserRole.ADMIN), 
    validateRequest(CategoryValidation.categoryUpdateValidation), 
    CategoryController.updateIntoDB
    )
router.delete("/:categoryId",
    auth(UserRole.ADMIN), CategoryController.deleteFromDB
    )




export const CategoryRoutes = router;