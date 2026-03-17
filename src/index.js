import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

import db from "./db/index.js";
import carsRouter from "./routes/cars.js";
import customersRouter from "./routes/customers.js";
import rentalsRouter from "./routes/rentals.js";
import authRouter from "./routes/auth.js";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.locals.models = db.models;

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Car Rental API",
      version: "1.0.0",
      description: "API for managing cars, customers, and rentals",
    },
    servers: [{ url: "http://localhost:" + port }],
  },
  apis: ["./src/routes/*.js"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/cars", carsRouter);
app.use("/customers", customersRouter);
app.use("/rentals", rentalsRouter);

app.get("/me", requireAuth, async (req, res) => {
  const { Customer } = app.locals.models;
  const user = await Customer.findByPk?.(req.user.id) || (await Customer.findById?.(req.user.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash, ...clean } = user.toJSON ? user.toJSON() : user;
  res.json(clean);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Car rental backend listening on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs`);
});
