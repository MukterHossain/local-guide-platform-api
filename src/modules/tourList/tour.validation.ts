
import { z } from "zod";

export const tourCreateValidation = z.object({
  title: z.string({message: "Title is required"}).min(1, "Title cannot be empty"),
  description: z.string({message: "Description is required"}).min(1, "Description cannot be empty"),
  city: z.string({message: "City is required"}).min(1, "City cannot be empty"),
  durationHours: z.number({message: "Duration in hours is required"}).positive("Duration must be positive"),
  tourFee: z.number({message: "Tour Fee is required"}).nonnegative("Tour fee cannot be negative"),
  maxPeople: z.number({message: "Maximum number of people is required"}).positive("Max people must be positive"),
  meetingPoint: z.string().optional(),
  images: z.array(z.any()).optional().default([]) // File array এর জন্য
})


 export const tourUpdateValidation = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    tourFee: z.number().optional(),
    durationHours: z.number().optional(),
    maxPeople: z.number().optional(),
    city: z.string().optional(),
    meetingPoint: z.string().optional(), 
    images: z.array(z.string()).optional().default([]),
    categories: z.array(
      z.object({
        categoryId: z.string()
      })
    ).optional().default([]),
})






