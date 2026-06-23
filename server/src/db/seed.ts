import mongoose from "mongoose";
import { APIError } from "better-auth/api";
import { config } from "../config/index.js";
import { createAuth } from "../auth/index.js";
import { connectDb } from "./connect.js";

async function seed() {
  await connectDb(config.mongodbUri);
  const auth = createAuth(mongoose.connection);

  const email = process.env.ADMIN_EMAIL || "admin@chat.local";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "admin";

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
    });
    console.log(`Admin created: ${email}`);
  } catch (error) {
    if (error instanceof APIError && error.status === 400) {
      console.log("Admin already exists");
    } else {
      throw error;
    }
  }

  const client = mongoose.connection.getClient();
  await client
    .db()
    .collection("user")
    .updateOne({ email }, { $set: { role: "admin" } });

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
