import { Prisma, User, UserRole, UserStatus } from "@prisma/client";
import { Request } from "express";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../shared/prisma";

const createTour = async (user:IJWTPayload, tourData: any)=>{
    if(!["GUIDE", "ADMIN"].includes(user.role)) {
        throw new Error("Only Guide/Admin can create tours");
    }

    const tour = await prisma.tour.create({
        data: {
            ...tourData,
            guideId: user.id
        }
    });
    console.log("bookingData", tour)
     
    return tour
}










export const TourService = {
    createTour
}