import { UserStatus } from "@prisma/client";
import { z } from "zod";

const tourCreateValidation = z.object({
  title: z.string({ message: "Title is required" }),
  description: z.string({ message: "Description is required" }),
  price: z.number({ message: "Price is required" }),
  durationHours: z.number({ message: "Duration is required" }),
  maxPeople: z.number({ message: "Max people is required" }),
  city: z.string({ message: "City is required" }),
  meetingPoint: z.string({ message: "Meeting point is required" }),
  images: z.array(
    z.object({
      url: z.string().url({ message: "Image URL must be valid" }),
      caption: z.string().optional()
    })
  ).optional(),
  categories: z.array(
    z.object({
      categoryId: z.string()
    }).optional()
  ).optional()
});

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