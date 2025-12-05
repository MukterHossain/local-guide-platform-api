import { z } from "zod";

const createReport = z.object({
    reporterId: z.string({message: "Reporter ID is required"}),
    guideId: z.string({message: "Guide ID is required"}),
    reason: z.string({message: "Reason is required"}),
    details: z.string().optional()
});
const updateReport = z.object({
    reason: z.string().optional(),
    details: z.string().optional()
});

export const ReportValidation = {
    createReport,
    updateReport
};