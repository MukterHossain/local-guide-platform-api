import { GuideVerificationStatus, PaymentStatus, UserRole } from "@prisma/client";
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

    const avgRating = await prisma.review.aggregate({
        _avg: {
            rating: true
        },
        where: {
            guideId: userDatafind.id
        }
    });

    const popularTour = await prisma.booking.groupBy({
        by: ['tourId'],
        _count: {
            id: true
        },
        where: { tour: { guideId: userDatafind.id }},
        orderBy: {_count: {id: "desc"}},
        take: 1
    })

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

    const formatedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    const barChartData = await prisma.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            tour: { guideId: userDatafind.id }
        }
    })

    const pieChartData = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            tour: { guideId: userDatafind.id }
        }
    })


    return {
        bookingCount,
        formatedBookingStatusDistribution,
        reviewCount,
        touristCount: touristCount.length,
        avgRating: avgRating._avg.rating,
        popularTour: popularTour[0],
        totalRevenue,
        barChartData,
        pieChartData
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

    const formatedBookingStatusDistribution = bookingStatusDistribution.map(({ status, _count }) => ({
        status,
        count: Number(_count.id)
    }))

    const upcomingBookings = await prisma.booking.count({
        where: {
            userId: userData.id,
            status: "CONFIRMED",
            createdAt: {
                gte: new Date()
            }
        }
    })

    const totalSpent = await prisma.payment.aggregate({
        _sum: {amount: true},
        where: {
            booking: {userId: userData.id},
            status: PaymentStatus.PAID
        }
    })

     const barChartData = await prisma.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            tour: { guideId: userData.id }
        }
    })

    const pieChartData = await prisma.booking.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
            tour: { guideId: userData.id }
        }
    })

    return {
        bookingCount,
        reviewCount,
        paymentCount,
        formatedBookingStatusDistribution,
        upcomingBookings,
        totalSpent,
        barChartData,
        pieChartData
    }
}


const getAdminMetaData = async () => {
   const guideCount = await prisma.user.count({
    where: { role: UserRole.GUIDE }
});

const touristCount = await prisma.user.count({
    where: { role: UserRole.TOURIST }
});

    const bookingCount = await prisma.booking.count()
    const paymentCount = await prisma.payment.count()

    const totalRevenue = await prisma.payment.aggregate({
        _sum: {
            amount: true
        },
        where: {
            status: PaymentStatus.PAID
        }
    })

    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0,
    23, 59, 59, 999);
    
   const rawTrend =  await prisma.booking.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });
   const bookingTrend =  Object.values(
    rawTrend.reduce((acc: any, item) => {
    const date = item.createdAt.toISOString().split("T")[0];

    if (!acc[date]) {
      acc[date] = { date, count: 0 };
    }

    acc[date].count += item._count.id;
    return acc;
  }, {})
   )

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const todyBookings = await prisma.booking.count({
        where: {
            createdAt: {
                gte: startOfToday,
                lte: endOfToday
            }
        }
    })

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999);
    
    const yesterdayBookings = await prisma.booking.count({
        where: {
            createdAt: {
                gte: startOfYesterday,
                lte: endOfYesterday
            }
        }
    })
    let bookingGrowth = 0;
    if(yesterdayBookings === 0 && todyBookings > 0){
        bookingGrowth = 100
    }else if(yesterdayBookings > 0){
        bookingGrowth = ((todyBookings - yesterdayBookings) / yesterdayBookings) * 100
    }

    bookingGrowth = Number(bookingGrowth.toFixed(1));

    const pendingGuideVerification = await prisma.user.count({
        where: {
            role: UserRole.GUIDE,
            profile: {
                verificationStatus: GuideVerificationStatus.PENDING
            }
        }
    })

     const unpaidPayments  = await prisma.payment.count({
        where:{
            status: PaymentStatus.UNPAID
        }
    })


    const barChartData = await getBarChartData();
    const pieChartData = await getPieChartData();

    return {
        guideCount,
        touristCount,
        bookingCount,
        paymentCount,
        totalRevenue,
        bookingTrend,
        bookingGrowth,
        pendingGuideVerification,
        unpaidPayments,
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