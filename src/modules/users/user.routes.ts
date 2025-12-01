import express, { NextFunction, Request, Response } from 'express'
import { UserController } from './user.controller';
import { fileUploader } from '../../helper/fileUploader';
import { userValidation } from './user.validation';

const router = express.Router();



router.get("/me", UserController.getMyProfile)
router.get("/", UserController.getAllFromDB)

router.post("/",
     fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createUserValidation.parse(JSON.parse(req.body.data))
    return UserController.createUser(req, res, next)
    }
    //  UserController.createUser
    )




export const UserRoutes = router;