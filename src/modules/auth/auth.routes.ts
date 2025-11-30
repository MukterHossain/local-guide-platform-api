import express, { NextFunction, Request, Response } from 'express'
import { AuthController } from './auth.controller';

import { UserRole } from '@prisma/client';

const router = express.Router();

router.post("/login", AuthController.login)

    



export const AuthRoutes = router;