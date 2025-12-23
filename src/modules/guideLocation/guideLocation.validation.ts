
import {  z } from "zod";


const createGuideLocationSchema = z.object({
  locationId:z.string({message: "Location ID is required"}),
  // guideId: z.string({message: "Guide ID is required"}),
})




export const GuideLocationValidation = {
    createGuideLocationSchema
};