import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller';
import { fileUploader } from '../../helper/fileUploader';
import { userValidation } from './user.validation';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { IJWTPayload } from '../../types/common';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();



router.get("/me",
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    UserController.getMyProfile)
router.get("/", auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST), UserController.getAllFromDB)

router.post(
    "/register",
    fileUploader.upload.single("file"),
    (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("REQ.BODY:", req.body);
            console.log("REQ.FILE:", req.file);

            if (!req.body?.data) {
                throw new Error("No JSON data found in 'data' field");
            }

            const parsed = JSON.parse(req.body.data);
            req.body = userValidation.createUserValidation.parse(parsed);

            return UserController.createUser(req, res, next);
        } catch (error) {
            next(error);
        }
    }
    // fileUploader.upload.single("file"), // single image
    // (req: Request, res: Response, next: NextFunction) => {
    //     req.body = userValidation.createUserValidation.parse(JSON.parse(req.body.data));
    //     return UserController.createUser(req, res, next);
    // }
);
router.post("/admin",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdminValidation.parse(JSON.parse(req.body.data))
        return UserController.createAdmin(req, res, next)
    }
)


router.patch(
    '/status/:id',
    auth(UserRole.ADMIN),
    validateRequest(userValidation.adminUpdateGuideStatus),
    UserController.changeUserStatus
);
router.patch("/update-profile",
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    fileUploader.upload.single('file'),
    (req: Request & { user?: IJWTPayload }, res: Response, next: NextFunction) => {
        // Tourist and Admin 
        if (req.user!.role === "TOURIST" || req.user!.role === "ADMIN") {
            req.body = userValidation.updateTouristAdnAdminSchema.parse(JSON.parse(req.body.data));
        }
        // Guide 
        if (req.user!.role === "GUIDE") {
            req.body = userValidation.updateGuideProfileSchema.parse(JSON.parse(req.body.data));
        }

        next()
    },
    UserController.updateMyProfie
)




export const UserRoutes = router;