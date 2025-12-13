import express, { NextFunction, Request, Response } from 'express'

import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { BookingController } from './booking.controller';

const router = express.Router();


router.get("/me",
    auth(UserRole.TOURIST , UserRole.GUIDE),
    BookingController.getMyBooking)
router.get("/:id",
    auth(UserRole.ADMIN, UserRole.GUIDE, UserRole.TOURIST),
    BookingController.getSingleByIdFromDB)

router.get("/", auth(UserRole.ADMIN), BookingController.getAllFromDB)

router.post("/",
    auth(UserRole.TOURIST), BookingController.createBooking
)
router.patch("/:id",
    auth(UserRole.TOURIST, UserRole.ADMIN), BookingController.updateIntoDB
)
router.patch("/status/:id",
    auth(UserRole.TOURIST, UserRole.ADMIN, UserRole.GUIDE), BookingController.updateBookingStatus
)
router.delete("/:id",
    auth(UserRole.TOURIST, UserRole.ADMIN), BookingController.deleteFromDB
)




export const BookingRoutes = router;