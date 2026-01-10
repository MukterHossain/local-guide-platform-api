
import { z } from "zod";


export const tourCreateValidation = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  city: z.string().min(1),
  durationHours: z.number().positive(),
  tourFee: z.number().nonnegative(),
  maxPeople: z.number().positive(),
  meetingPoint: z.string().optional(),

  images: z.array(z.string()).optional().default([]),

  categories: z.array(
    z.object({
      categoryId: z.string()
    })
  ).min(1, "At least one category is required")
});


export const tourUpdateValidation = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  tourFee: z.number().optional(),
  durationHours: z.number().optional(),
  maxPeople: z.number().optional(),
  city: z.string().optional(),
  meetingPoint: z.string().optional(),

  images: z.array(z.string()).optional(),

  categories: z.array(
    z.object({
      categoryId: z.string()
    })
  ).optional()
});

export const tourListUpdateValidation = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "BLOCKED"], {
    message: "Invalid tour status",
  }),
});






