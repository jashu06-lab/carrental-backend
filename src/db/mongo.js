import mongoose from "mongoose";

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

  return { mongoose: conn, models: { Customer, Car, Rental } };
}
