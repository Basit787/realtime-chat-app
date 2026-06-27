import mongoose from "mongoose";
import { APIError } from "better-auth/api";
import { createAuth } from "../auth/index.js";

export async function seedAdmin(connection: mongoose.Connection) {
  const auth = createAuth(connection);
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

  const client = connection.getClient();
  await client.db().collection("user").updateOne({ email }, { $set: { role: "admin" } });
}
