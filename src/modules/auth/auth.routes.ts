import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from './auth.controller';

import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { changePasswordSchema } from './auth.validation';

const router = express.Router();


router.get(
    "/me",
    AuthController.getMe
)
router.post("/login", AuthController.login)

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.post(
    '/change-password',
    auth(
        UserRole.ADMIN,
        UserRole.GUIDE,
        UserRole.TOURIST
    ),
    validateRequest(changePasswordSchema),
    AuthController.changePassword
);



export const AuthRoutes = router;