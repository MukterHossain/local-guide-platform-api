import { UserStatus } from "@prisma/client";
import { z } from "zod";

const profileValidation = z.object({
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
  pricePerHour: z.number().optional(),
  locationId: z.string().optional(),
  nidOrPassportUrl: z.string().optional(),
}).optional();

const createUserValidation = z.object({
    password: z.string({
        message: "Password is required",
    }),
    name: z.string({
        message: "Name is required!",
    }),
    email: z.string({
        message: "Email is required!",
    }),
    phone: z.string({
        message: "Contact Number is required!",
    }),
    image: z.string().optional(),
    address: z.string().optional(),
     role: z.enum(["USER", "GUIDE"]).default("USER"),
     profile: profileValidation
   
});

const createAdminValidation = z.object({
  password: z.string({ message: "Password is required" }),
  name: z.string({ message: "Name is required" }),
  email: z.string({ message: "Email is required" }),
  phone: z.string({ message: "Contact Number is required" }),
  image: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["ADMIN"]), 
});




const updateStatus = z.object({
    body: z.object({
        status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.DELETED, UserStatus.PENDING]).optional(),
    }),
});

export const userValidation = {
    profileValidation,
    createUserValidation,
    createAdminValidation,
    updateStatus
};