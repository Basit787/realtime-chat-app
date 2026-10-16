import mongoose from "mongoose";

export const connectDb = async (uri: string) => {
  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to connect to MongoDB");
  }
};
