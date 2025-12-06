import express from 'express';
import { UserRoutes } from '../modules/users/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { BookingRoutes } from '../modules/bookings/booking.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { TourCategoryRoutes } from '../modules/tourCategory/tourCategory.routes';
import { AvailabilityRoutes } from '../modules/availability/availability.routes';
import { LocationRoutes } from '../modules/location/location.routes';
import { GuideLocationRoutes } from '../modules/guideLocation/guideLocation.routes';
import { TourListRoutes } from '../modules/tourList/tour.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { ReportRoutes } from '../modules/report/report.routes';
import { WishlistRoutes } from '../modules/wishlist/wishlist.routes';


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
        path: '/bookings',
        route: BookingRoutes
    },
    {
        path: '/listings',
        route: TourListRoutes
    },
    {
        path: '/category',
        route: CategoryRoutes
    },
    {
        path: '/tour-category',
        route: TourCategoryRoutes
    },
    {
        path: '/availability',
        route: AvailabilityRoutes
    },
    {
        path: '/location',
        route: LocationRoutes
    },
    {
        path: '/guideLocation',
        route: GuideLocationRoutes
    },
    {
        path: '/review',
        route: ReviewRoutes
    },
    {
        path: '/report',
        route: ReportRoutes
    },
    {
        path: '/wishlist',
        route: WishlistRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;