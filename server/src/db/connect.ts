import mongoose from "mongoose";

export async function connectDb(uri: string) {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to connect to MongoDB");
  }
}
