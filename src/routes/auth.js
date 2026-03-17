/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */
import express from "express";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../middleware/auth.js";
import { isSequelizeModel, isMongooseModel } from "../utils/db.js";

const router = express.Router();

function getModels(req) {
  return req.app.locals.models;
}

function scrubUser(user) {
  if (!user) return null;
  const json = typeof user.toJSON === "function" ? user.toJSON() : user;
  const { passwordHash, ...rest } = json;
  return rest;
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registered user
 */
router.post("/register", validate(registerSchema), async (req, res) => {
  const { Customer } = getModels(req);
  const { firstName, lastName, email, password } = req.validatedBody;

  const passwordHash = hashPassword(password);

  const existing = isSequelizeModel(Customer)
    ? await Customer.findOne({ where: { email } })
    : await Customer.findOne({ email });

  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }

  const user = await Customer.create({ firstName, lastName, email, passwordHash });
  const token = signToken({ id: user.id, email: user.email });

  res.status(201).json({ user: scrubUser(user), token });
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login and get a JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated token
 */
router.post("/login", validate(loginSchema), async (req, res) => {
  const { Customer } = getModels(req);
  const { email, password } = req.validatedBody;

  const user = isSequelizeModel(Customer)
    ? await Customer.findOne({ where: { email } })
    : await Customer.findOne({ email });

  if (!user || !comparePassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken({ id: user.id, email: user.email });
  res.json({ user: scrubUser(user), token });
});

export default router;
