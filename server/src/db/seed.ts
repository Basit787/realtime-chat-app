import mongoose from "mongoose";
import { config } from "../config/index.js";
import { connectDb } from "./connect.js";
import { seedAdmin } from "./seed-admin.js";

async function seed() {
  await connectDb(config.mongodbUri);
  await seedAdmin(mongoose.connection);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
