/**
 * @openapi
 * tags:
 *   - name: Customers
 *     description: Customer management endpoints
 */
import express from "express";
import { validate } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { createCustomerSchema, updateCustomerSchema } from "../schemas/customer.js";
import { parsePagination, buildResponsePage } from "../utils/pagination.js";
import { hashPassword } from "../utils/hash.js";
import { isSequelizeModel, isMongooseModel, toJson } from "../utils/db.js";

const router = express.Router();

function getModels(req) {
  return req.app.locals.models;
}

function scrubCustomer(customer) {
  const json = toJson(customer);
  if (!json) return json;
  const { passwordHash, ...clean } = json;
  return clean;
}

// GET /customers
router.get("/", requireAuth, async (req, res) => {
  const { Customer } = getModels(req);
  const { page, pageSize, offset, limit } = parsePagination(req.query);

  if (isSequelizeModel(Customer)) {
    const result = await Customer.findAndCountAll({ offset, limit });
    return res.json(buildResponsePage(result.rows.map(scrubCustomer), result.count, page, pageSize));
  }

  if (isMongooseModel(Customer)) {
    const [data, count] = await Promise.all([
      Customer.find({}).skip(offset).limit(limit).lean(),
      Customer.countDocuments(),
    ]);

    return res.json(buildResponsePage(data.map((c) => {
      const { passwordHash, ...rest } = c;
      return rest;
    }), count, page, pageSize));
  }

  res.status(500).json({ error: "Database driver not supported" });
});

// GET /customers/:id
router.get("/:id", requireAuth, async (req, res) => {
  const { Customer } = getModels(req);
  const id = req.params.id;

  const customer = isSequelizeModel(Customer) ? await Customer.findByPk(id) : await Customer.findById(id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  res.json(scrubCustomer(customer));
});

// POST /customers
router.post("/", validate(createCustomerSchema), async (req, res) => {
  const { Customer } = getModels(req);
  const payload = { ...req.validatedBody };

  if (payload.password) {
    payload.passwordHash = hashPassword(payload.password);
    delete payload.password;
  }

  const customer = await Customer.create(payload);
  res.status(201).json(scrubCustomer(customer));
});

// PUT /customers/:id
router.put("/:id", requireAuth, validate(updateCustomerSchema), async (req, res) => {
  const { Customer } = getModels(req);
  const id = req.params.id;

  const customer = isSequelizeModel(Customer) ? await Customer.findByPk(id) : await Customer.findById(id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  const update = { ...req.validatedBody };
  if (update.password) {
    update.passwordHash = hashPassword(update.password);
    delete update.password;
  }

  await customer.update ? customer.update(update) : customer.set(update);
  await customer.save?.();

  res.json(scrubCustomer(customer));
});

// DELETE /customers/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { Customer } = getModels(req);
  const id = req.params.id;

  const customer = isSequelizeModel(Customer) ? await Customer.findByPk(id) : await Customer.findById(id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });

  await customer.destroy?.();
  res.status(204).end();
});

export default router;
