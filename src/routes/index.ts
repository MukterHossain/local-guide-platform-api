import express from 'express';
import { UserRoutes } from '../modules/users/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BookingRoutes } from '../modules/bookings/booking.routes';
import { TourRoutes } from '../modules/tour/tour.routes';
import { CategoryRoutes } from '../modules/category/category.routes';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/user',
        route: UserRoutes
    },
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/booking',
        route: BookingRoutes
    },
    {
        path: '/tour',
        route: TourRoutes
    },
    {
        path: '/category',
        route: CategoryRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;