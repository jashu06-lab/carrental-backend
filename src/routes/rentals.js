/**
 * @openapi
 * tags:
 *   - name: Rentals
 *     description: Rental contract management endpoints
 */
import express from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { createRentalSchema, returnRentalSchema } from "../schemas/rental.js";
import { parsePagination, buildResponsePage } from "../utils/pagination.js";
import { isSequelizeModel, isMongooseModel, toJson } from "../utils/db.js";

const router = express.Router();

function getModels(req) {
  return req.app.locals.models;
}

function normalizeRental(rental) {
  const json = toJson(rental);
  if (!json) return json;
  return json;
}

// GET /rentals
router.get("/", requireAuth, async (req, res) => {
  const { Rental, Car, Customer } = getModels(req);
  const { page, pageSize, offset, limit } = parsePagination(req.query);

  if (isSequelizeModel(Rental)) {
    const result = await Rental.findAndCountAll({
      include: [
        { model: Car, as: "Car" },
        { model: Customer, as: "Customer" },
      ],
      offset,
      limit,
    });

    return res.json(buildResponsePage(result.rows.map(normalizeRental), result.count, page, pageSize));
  }

  if (isMongooseModel(Rental)) {
    const [data, count] = await Promise.all([
      Rental.find()
        .skip(offset)
        .limit(limit)
        .populate("carId")
        .populate("customerId")
        .lean(),
      Rental.countDocuments(),
    ]);

    return res.json(buildResponsePage(data, count, page, pageSize));
  }

  res.status(500).json({ error: "Database driver not supported" });
});

// GET /rentals/:id
router.get("/:id", requireAuth, async (req, res) => {
  const { Rental, Car, Customer } = getModels(req);
  const id = req.params.id;

  let rental;
  if (isSequelizeModel(Rental)) {
    rental = await Rental.findByPk(id, { include: [Car, Customer] });
  } else {
    rental = await Rental.findById(id).populate("carId").populate("customerId");
  }

  if (!rental) return res.status(404).json({ error: "Rental not found" });
  res.json(normalizeRental(rental));
});

// POST /rentals
router.post("/", requireAuth, validate(createRentalSchema), async (req, res) => {
  const { Rental, Car } = getModels(req);
  const { carId, customerId, startDate, expectedReturnDate } = req.validatedBody;

  const car = isSequelizeModel(Car) ? await Car.findByPk(carId) : await Car.findById(carId);
  if (!car) return res.status(404).json({ error: "Car not found" });
  if (!car.available) return res.status(400).json({ error: "Car is not currently available" });

  const rental = await Rental.create({ carId, customerId, startDate, expectedReturnDate });
  if (car.update) {
    await car.update({ available: false });
  } else {
    car.available = false;
    await car.save();
  }

  res.status(201).json(normalizeRental(rental));
});

// POST /rentals/:id/return
router.post("/:id/return", requireAuth, validate(returnRentalSchema), async (req, res) => {
  const { Rental, Car } = getModels(req);
  const id = req.params.id;

  const rental = isSequelizeModel(Rental) ? await Rental.findByPk(id) : await Rental.findById(id);
  if (!rental) return res.status(404).json({ error: "Rental not found" });
  if (rental.status !== "active") return res.status(400).json({ error: "Rental is not active" });

  const returnDate = req.validatedBody.actualReturnDate || new Date().toISOString();
  rental.status = "returned";
  rental.actualReturnDate = returnDate;

  await rental.save?.();
  if (isSequelizeModel(Car)) {
    const car = await Car.findByPk(rental.carId);
    if (car) await car.update({ available: true });
  } else {
    const car = await Car.findById(rental.carId);
    if (car) {
      car.available = true;
      await car.save();
    }
  }

  res.json(normalizeRental(rental));
});

export default router;
