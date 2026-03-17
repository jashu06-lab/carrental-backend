import { z } from "zod";

export const createCustomerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();
