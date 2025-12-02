import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { BookingController } from './booking.controller';

const router = express.Router();



router.get("/:bookingId",
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.USER),
    BookingController.getSingleByIdFromDB)
router.get("/me",
    auth(UserRole.USER),
    BookingController.getMyBooking)
router.get("/", auth(UserRole.ADMIN), BookingController.getAllFromDB)

router.post("/",
    auth(UserRole.USER), BookingController.createBooking
    )




export const BookingRoutes = router;