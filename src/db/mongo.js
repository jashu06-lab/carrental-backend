import mongoose from "mongoose";
import { hashPassword } from "../utils/hash.js";

const customerSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    passwordHash: { type: String },
  },
  { timestamps: true }
);

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    licensePlate: { type: String },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const rentalSchema = new mongoose.Schema(
  {
    carId: { type: mongoose.Schema.Types.ObjectId, ref: "Car", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    startDate: { type: Date, required: true },
    expectedReturnDate: { type: Date, required: true },
    actualReturnDate: { type: Date },
    status: { type: String, enum: ["active", "returned"], default: "active" },
  },
  { timestamps: true }
);

export async function initMongo(mongoUri = "mongodb://localhost:27017/carrental") {
  const conn = await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const Customer = conn.model("Customer", customerSchema);
  const Car = conn.model("Car", carSchema);
  const Rental = conn.model("Rental", rentalSchema);

  // Seed initial data for demo
  const carCount = await Car.countDocuments();
  if (carCount === 0) {
    await Car.insertMany([
      { make: "Toyota", model: "Camry", year: 2020, dailyRate: 50.00, licensePlate: "ABC123", available: true },
      { make: "Honda", model: "Civic", year: 2019, dailyRate: 45.00, licensePlate: "DEF456", available: true },
      { make: "Ford", model: "Focus", year: 2021, dailyRate: 40.00, licensePlate: "GHI789", available: false },
    ]);
  }

  const customerCount = await Customer.countDocuments();
  if (customerCount === 0) {
    await Customer.insertMany([
      { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "123-456-7890", passwordHash: hashPassword("password") },
      { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "098-765-4321", passwordHash: hashPassword("password") },
    ]);
  }

  return { mongoose: conn, models: { Customer, Car, Rental } };
}
