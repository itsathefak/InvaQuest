import { z } from "zod";

export const sightingSchema = z.object({
    speciesId: z.string().min(1, "Species is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    description: z.string().optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
});

export type SightingInput = z.infer<typeof sightingSchema>;
