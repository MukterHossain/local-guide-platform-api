
import { z } from "zod";

const  tourCategoryCreateValidation = z.object({
  tourId: z.string({ message: "Tour ID is required" }),
  categoryId: z.string({ message: "Category ID is required" }),
});





export const tourCategoryValidation = {
    tourCategoryCreateValidation
};