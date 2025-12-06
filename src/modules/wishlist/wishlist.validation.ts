
import { z } from "zod";

const  wishlistCreateValidation = z.object({
  userId: z.string({message: "User ID is required"}),
    title: z.string({message: "Title is required"}),
    message: z.string({message: "Message is required"}),
    meta: z.any().optional(),
});


const wishlistUpdateValidation = z.object({
  title: z.string().optional(),
    message: z.string().optional(),
    meta: z.any().optional(),
    read: z.boolean().optional(),
});









export const wishlistValidation = {
  wishlistCreateValidation,
  wishlistUpdateValidation,
};