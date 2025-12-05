import { z } from "zod";

const create = z.object({
    tourId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
});

export const ReviewValidation = {
    create
};