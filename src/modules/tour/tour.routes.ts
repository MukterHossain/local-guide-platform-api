import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { TourController } from './tour.controller';

const router = express.Router();




router.post("/",
    auth(UserRole.GUIDE, UserRole.ADMIN), TourController.createTour
    )




export const TourRoutes = router;