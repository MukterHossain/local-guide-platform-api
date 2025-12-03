import { UserStatus } from "@prisma/client";
import { z } from "zod";

const categoryCreateValidation = z.object({
  name: z
    .string({ message: "Category name is required" })
    .min(2, { message: "Category name cannot be empty" }),
});

const categoryUpdateValidation = z.object({
  name: z.string().min(1).optional(),
});




export const CategoryValidation = {
    categoryCreateValidation,
    categoryUpdateValidation
};