import mongoose from "mongoose";
import { config } from "../config/index.js";
import { Message, SharedFile } from "../models/index.js";
import { connectDb } from "./connect.js";

const reset = async () => {
  await connectDb(config.mongodbUri);
  const client = mongoose.connection.getClient();
  const db = client.db();

  await Promise.all([
    Message.deleteMany({}),
    SharedFile.deleteMany({}),
    db.collection("user").deleteMany({}),
    db.collection("session").deleteMany({}),
    db.collection("account").deleteMany({}),
    db.collection("verification").deleteMany({}),
  ]);

  console.log("Database cleared (users, sessions, messages, files)");
  process.exit(0);
};

reset().catch((err) => {
  console.error(err);
  process.exit(1);
});
