
import { z } from "zod";

const tourCreateValidation = z.object({
  title: z.string({message: "Title is required"}),
  description: z.string({message: "Description is required"}),
  city: z.string({message: "City is required"}),
  durationHours: z.number({message: "Duration in hours is required"}),
  tourFee: z.number({message: "Tour Fee is required"}),
  maxPeople: z.number({message: "Maximum number of people is required"}),
   meetingPoint: z.string().optional(),
   images: z.array(z.string()).optional().default([])
})


const tourUpdateValidation = z.object({
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
    ).optional(),
})









export const tourValidation = {
    tourUpdateValidation,
    tourCreateValidation
};