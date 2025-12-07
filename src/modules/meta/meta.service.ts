import { PaymentStatus, UserRole } from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import httpStatus from 'http-status'

import { prisma } from "../../shared/prisma";
import ApiError from "../../error/ApiError";


const fetchDashboardMetaData = async (user: IJWTPayload) => {
    let metadata;
    switch (user.role) {
        case UserRole.ADMIN:
            metadata = await getAdminMetaData();
            break;
        case UserRole.GUIDE:
            metadata = await getGuideMetaData(user);
            break;
        case UserRole.TOURIST:
            metadata = await getTouristMetaData(user);
            break;
        default:
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role!")
    }

    return metadata;
};


const getGuideMetaData = async (user: IJWTPayload) => {
    const userDatafind = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    const bookingCount = await prisma.booking.count({
        where: {
         tour: {
            guideId: userDatafind.id
         }
        }
    });

    const touristCount = await prisma.booking.groupBy({
        by: ['userId'],
        _count: {
            id: true
        },
        
    });

    const reviewCount = await prisma.review.count({
        where: {
            guideId: userDatafind.id
        }
    });

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            status: PaymentStatus.PAID,
            booking: {
                tour: {
                    guideId: userDatafind.id
                }
            }
        }
    });

    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            tour: { guideId: userDatafind.id }
        }
    });

    const formattedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    return {
        bookingCount,
        formattedBookingStatusDistribution,
        reviewCount,
        touristCount: touristCount.length,
        totalRevenue,
    }
}

const getTouristMetaData = async (user: IJWTPayload) => {
    const userData = await prisma.user.findUniqueOrThrow({
        where: {
            email: user?.email
        }
    });
    const bookingCount = await prisma.booking.count({
        where: {
            userId: userData.id
        }
    });

    const paymentCount = await prisma.payment.count({
        where: {
            booking: {
                userId: userData.id
            }
        }
    });

    const reviewCount = await prisma.review.count({
        where: {
            userId: userData.id
        }
    });

    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            userId: userData.id
        }
    });

    const formattedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    return {
        bookingCount,
        reviewCount,
        paymentCount,
        formattedBookingStatusDistribution
    }
}


const getAdminMetaData = async () => {
   const guideCount = await prisma.user.count({
    where: { role: UserRole.GUIDE }
});

const touristCount = await prisma.user.count({
    where: { role: UserRole.TOURIST }
});

const adminCount = await prisma.user.count({
    where: { role: UserRole.ADMIN }
});
    const bookingtCount = await prisma.booking.count()
    const paymentCount = await prisma.payment.count()

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            status: PaymentStatus.PAID
        }
    })

    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        guideCount,
        touristCount,
        bookingtCount,
        adminCount,
        paymentCount,
        totalRevenue,
        barChartData,
        pieChartData
    }

}


const getBarChartData = async () => {
    return prisma.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true }
    });
}

const getPieChartData = async () => {
    const bookingStatusDistribution = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    const formatedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }));

    return formatedBookingStatusDistribution;
}


export const MetaService = {
    fetchDashboardMetaData
}