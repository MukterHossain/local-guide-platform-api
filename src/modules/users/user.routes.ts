import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller';
import { fileUploader } from '../../helper/fileUploader';
import { userValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();



router.get("/me",
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    UserController.getMyProfile)
router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), UserController.getAllFromDB)

// router.post("/register",
//      fileUploader.upload.single('file'),
//     (req: Request, res: Response, next: NextFunction) => {
//         req.body = userValidation.createUserValidation.parse(JSON.parse(req.body.data))
//     return UserController.createUser(req, res, next)
//     }
//     )
    router.post(
    "/register",
    fileUploader.upload.single("file"), // single image
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createUserValidation.parse(JSON.parse(req.body.data));
        return UserController.createUser(req, res, next);
    }
);
router.post("/admin",
     fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdminValidation.parse(JSON.parse(req.body.data))
    return UserController.createAdmin(req, res, next)
    }
    )




export const UserRoutes = router;