import { UserStatus } from "@prisma/client";
import { z } from "zod";

const tourCreateValidation = z.object({
  title: z.string({message: "Title is required"}),
  description: z.string({message: "Description is required"}),
  city: z.string({message: "City is required"}),
  durationHours: z.number({message: "Duration in hours is required"}),
  price: z.number({message: "Price is required"}),
  maxPeople: z.number({message: "Maximum number of people is required"}),
})


const tourUpdateValidation = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    durationHours: z.number().optional(),
    maxPeople: z.number().optional(),
    city: z.string().optional(),
    meetingPoint: z.string().optional(),   
    images: z.array(
      z.object({
        url: z.string().url(),
        caption: z.string().optional()
      })
    ).optional(), 
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