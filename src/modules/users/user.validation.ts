import { UserStatus } from "@prisma/client";
import { z } from "zod";

const profileValidation = z.object({
   image: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  address: z.string().optional(),

  // Guide only
  expertise: z.string().optional(),
  experienceYears: z.number().optional(),
  dailyRate: z.number().optional(),
  locationId: z.string().nullable().optional(),
}).optional();

export const touristPreferenceValidation = z.object({
  interests: z.array(z.string()).optional(),
  preferredLangs: z.array(z.string()).optional(),
  travelStyle: z.enum(["CASUAL", "ADVENTURE", "LUXURY"]),
  groupSize: z.number().optional(),
  travelPace: z.enum(["SLOW", "MODERATE", "FAST"]).optional(),
});


export const createUserValidation = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  role: z.enum(["TOURIST", "GUIDE"]).default("TOURIST"),

  profile: profileValidation.optional(),
});

const createAdminValidation = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  // gender: z.enum(["MALE", "FEMALE"]).optional(), 
});

const updateUserValidation = z.object({
 name: z.string().optional(),
  phone: z.string().optional(),

  profile: profileValidation.optional(),
  touristPreference: touristPreferenceValidation.optional(),
});






const adminUpdateGuideStatus = z.object({
  verificationStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).optional(),
  status: z.enum(["ACTIVE", "PENDING", "BLOCKED", "DELETED"]).optional(),
  adminNote: z.string().optional(),
});

export const userValidation = {
    profileValidation,
    createUserValidation,
    createAdminValidation,
    updateUserValidation,
    adminUpdateGuideStatus
};