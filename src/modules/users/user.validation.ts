import { UserStatus } from "@prisma/client";
import { z } from "zod";

const profileValidation = z.object({
   experienceYears: z.number().optional(),
   expertise: z.string().optional(),
  feePerHour: z.number().optional(),
  avgRating: z.number().optional(),
  locationId: z.string().optional().nullable(),
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
    gender: z.enum(["MALE", "FEMALE"]),
    phone: z.string({
        message: "Contact Number is required!",
    }),
    languages: z.array(z.string()).optional(),
    image: z.string().optional(),
     bio: z.string().optional(),
    address: z.string().optional(),
     role: z.enum(["TOURIST", "GUIDE"]).default("TOURIST"),
     profile: profileValidation
   
});

const createAdminValidation = z.object({
  password: z.string({ message: "Password is required" }),
  name: z.string({ message: "Name is required" }),
  email: z.string({ message: "Email is required" }),
  gender: z.enum(["MALE", "FEMALE"]),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  phone: z.string({ message: "Contact Number is required" }),
  image: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(["ADMIN"]), 
});

const updateTouristAdminSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

const updateGuideProfileSchema = z.object({
   name: z.string().optional(),
    phone: z.string().optional(),
    image: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    languages: z.array(z.string()).optional(),
    role: z.enum(["TOURIST", "GUIDE"]).default("TOURIST").optional(),

  profile: z.object({
    expertise: z.string().optional(),
    experienceYears: z.number().optional(),
    locationId: z.string().optional(),
    availableStatus: z.boolean().optional(),
    feePerHour: z.number().optional(),
  }).optional()
});




const adminUpdateGuideStatus = z.object({
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  adminNote: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "BLOCKED", "DELETED"]).optional()
});

export const userValidation = {
    profileValidation,
    createUserValidation,
    createAdminValidation,
    updateTouristAdminSchema,
    updateGuideProfileSchema,
    adminUpdateGuideStatus
};