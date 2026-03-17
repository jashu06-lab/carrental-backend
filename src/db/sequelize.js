import { Sequelize, DataTypes } from "sequelize";

export async function initSequelize({ dialect, databaseUrl, sqliteStorage }) {
  const sequelize = databaseUrl
    ? new Sequelize(databaseUrl, {
        dialect,
        logging: false,
      })
    : new Sequelize({
        dialect: "sqlite",
        storage: sqliteStorage,
        logging: false,
      });

  const Customer = sequelize.define("Customer", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    passwordHash: { type: DataTypes.STRING, allowNull: true },
  });

  const Car = sequelize.define("Car", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    make: { type: DataTypes.STRING, allowNull: false },
    model: { type: DataTypes.STRING, allowNull: false },
    year: { type: DataTypes.INTEGER, allowNull: false },
    dailyRate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    licensePlate: { type: DataTypes.STRING, allowNull: true },
    available: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  });

  const Rental = sequelize.define("Rental", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    expectedReturnDate: { type: DataTypes.DATEONLY, allowNull: false },
    actualReturnDate: { type: DataTypes.DATEONLY, allowNull: true },
    status: { type: DataTypes.ENUM("active", "returned"), allowNull: false, defaultValue: "active" },
  });

  Customer.hasMany(Rental, { foreignKey: "customerId" });
  Rental.belongsTo(Customer, { foreignKey: "customerId" });

  Car.hasMany(Rental, { foreignKey: "carId" });
  Rental.belongsTo(Car, { foreignKey: "carId" });

  await sequelize.sync();

  return { sequelize, models: { Customer, Car, Rental } };
}
