import { z } from "zod";

export const updateRepoSettingsSchema = z.object({
    body: z.object({
        alertThresholds: z
            .object({
                churnRate: z.number().min(0).max(100).optional(),
                openPRs: z.number().int().min(1).optional(),
                highRiskPRs: z.number().int().min(1).optional(),
                criticalAlerts: z.number().int().min(1).optional(),
            })
            .optional(),
        notifications: z
            .object({
                email: z.boolean().optional(),
                highRiskPRAlerts: z.boolean().optional(),
                criticalAlerts: z.boolean().optional(),
                weeklySummary: z.boolean().optional(),
            })
            .optional(),
    }),
});
