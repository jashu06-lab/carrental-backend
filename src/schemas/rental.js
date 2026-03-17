import { z } from "zod";

export const createRentalSchema = z.object({
  carId: z.string().uuid(),
  customerId: z.string().uuid(),
  startDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid startDate",
  }),
  expectedReturnDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid expectedReturnDate",
  }),
});

export const returnRentalSchema = z.object({
  actualReturnDate: z.string().optional(),
});
