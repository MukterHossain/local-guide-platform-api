
import {  z } from "zod";


const createLocationSchema = z.object({
  city:z.string({message: "City is required"}),
  country: z.string({message: "Country is required"}),
})
const updateLocaionSchema = z.object({
  city:z.string().optional(),
  country: z.string().optional(),
})




export const LocationValidation = {
    createLocationSchema,
    updateLocaionSchema
};