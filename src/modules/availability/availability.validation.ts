
import {  z } from "zod";


const createAvailabilitySchema = z.object({
  tourId: z.string({ message: "Tour ID is required" }),
  startAt: z.string({message: "Start time is required"}),
    endAt: z.string({message: "End time is required"}),
})
const updateAvailabilitySchema = z.object({
  startAt: z.string().optional(),
    endAt: z.string().optional(),
    isBooked: z.boolean().optional(),
})




export const AvailabelityValidation = {
    createAvailabilitySchema,
    updateAvailabilitySchema
};