import dotenv from "dotenv";
import { initSequelize } from "./sequelize.js";
import { initMongo } from "./mongo.js";

dotenv.config();

const dbType = (process.env.DB_TYPE || "sqlite").toLowerCase();

let db;

if (dbType === "mongo") {
  db = await initMongo(process.env.MONGO_URI);
} else {
  db = await initSequelize({
    dialect: dbType === "postgres" ? "postgres" : "sqlite",
    databaseUrl: process.env.DATABASE_URL,
    sqliteStorage: process.env.SQLITE_FILE || "./data/db.sqlite",
  });
}

export default db;
