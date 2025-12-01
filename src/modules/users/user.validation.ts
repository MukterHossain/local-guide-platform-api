import { UserStatus } from "@prisma/client";
import { z } from "zod";

const createUserValidation = z.object({
    password: z.string({
        error: "Password is required",
    }),
    name: z.string({
        error: "Name is required!",
    }),
    email: z.string({
        error: "Email is required!",
    }),
    phone: z.string({
        error: "Contact Number is required!",
    }),
    image: z.string().optional(),
    address: z.string().optional(),
   
});




const updateStatus = z.object({
    body: z.object({
        status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED, UserStatus.PENDING]).optional(),
    }),
});

export const userValidation = {
    createUserValidation,
    updateStatus
};