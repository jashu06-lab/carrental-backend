/**
 * @openapi
 * tags:
 *   - name: Cars
 *     description: Car management endpoints
 */
import express from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { createCarSchema, updateCarSchema } from "../schemas/car.js";
import { parsePagination, buildResponsePage } from "../utils/pagination.js";
import { isSequelizeModel, isMongooseModel, toJson } from "../utils/db.js";

const router = express.Router();

function getModels(req) {
  return req.app.locals.models;
}

// GET /cars
router.get("/", async (req, res) => {
  const { Car } = getModels(req);
  const { page, pageSize, offset, limit } = parsePagination(req.query);

  if (isSequelizeModel(Car)) {
    const where = {};
    if (req.query.make) where.make = req.query.make;
    if (req.query.model) where.model = req.query.model;
    if (req.query.available !== undefined) where.available = req.query.available === "true";

    const result = await Car.findAndCountAll({ where, offset, limit });
    return res.json(buildResponsePage(result.rows, result.count, page, pageSize));
  }

  if (isMongooseModel(Car)) {
    const filter = {};
    if (req.query.make) filter.make = req.query.make;
    if (req.query.model) filter.model = req.query.model;
    if (req.query.available !== undefined) filter.available = req.query.available === "true";

    const [data, count] = await Promise.all([
      Car.find(filter).skip(offset).limit(limit).lean(),
      Car.countDocuments(filter),
    ]);

    return res.json(buildResponsePage(data, count, page, pageSize));
  }

  res.status(500).json({ error: "Database driver not supported" });
});

// GET /cars/:id
router.get("/:id", async (req, res) => {
  const { Car } = getModels(req);
  const id = req.params.id;

  const car = isSequelizeModel(Car) ? await Car.findByPk(id) : await Car.findById(id);
  if (!car) return res.status(404).json({ error: "Car not found" });

  res.json(toJson(car));
});

// POST /cars
router.post("/", requireAuth, validate(createCarSchema), async (req, res) => {
  const { Car } = getModels(req);
  const car = await Car.create({ ...req.validatedBody });
  res.status(201).json(toJson(car));
});

// PUT /cars/:id
router.put("/:id", requireAuth, validate(updateCarSchema), async (req, res) => {
  const { Car } = getModels(req);
  const id = req.params.id;

  const car = isSequelizeModel(Car) ? await Car.findByPk(id) : await Car.findById(id);
  if (!car) return res.status(404).json({ error: "Car not found" });

  await car.update ? car.update(req.validatedBody) : car.set(req.validatedBody);
  await car.save?.();

  res.json(toJson(car));
});

// DELETE /cars/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { Car } = getModels(req);
  const id = req.params.id;

  const car = isSequelizeModel(Car) ? await Car.findByPk(id) : await Car.findById(id);
  if (!car) return res.status(404).json({ error: "Car not found" });

  await car.destroy?.();
  res.status(204).end();
});

export default router;
