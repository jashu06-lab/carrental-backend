import { z } from "zod";

export const createCarSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().gte(1900).lte(2100),
  dailyRate: z.number().positive(),
  licensePlate: z.string().optional().nullable(),
});

export const updateCarSchema = createCarSchema.partial();
