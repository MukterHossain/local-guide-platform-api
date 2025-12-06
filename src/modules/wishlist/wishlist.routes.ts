import express, { NextFunction, Request, Response } from 'express'
import { fileUploader } from '../../helper/fileUploader';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { WishlistController } from './wishlist.controller';
import validateRequest from '../../middlewares/validateRequest';
import { wishlistValidation } from './wishlist.validation';

const router = express.Router();





router.get("/:wishlistId",
    auth(UserRole.ADMIN,  UserRole.TOURIST),
    WishlistController.getSingleByIdFromDB)

router.get("/", auth(UserRole.ADMIN, UserRole.TOURIST), WishlistController.getAllFromDB)

router.post("/",
    validateRequest(wishlistValidation.wishlistCreateValidation),
    auth(UserRole.TOURIST), WishlistController.inserIntoDB
)
router.patch("/:wishlistId",
    auth(UserRole.TOURIST, UserRole.ADMIN), WishlistController.updateIntoDB
)
router.patch("/:wishlistId",
    auth(UserRole.TOURIST, UserRole.ADMIN, UserRole.GUIDE), 
    validateRequest(wishlistValidation.wishlistUpdateValidation),WishlistController.updateIntoDB
)
router.delete("/:wishlistId",
    auth(UserRole.TOURIST, UserRole.ADMIN), WishlistController.deleteFromDB
)




export const WishlistRoutes = router;