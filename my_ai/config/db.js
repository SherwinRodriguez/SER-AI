import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export default async function connectDB() {
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }
  if (!cached.promise) {
    console.log("Creating new MongoDB connection promise");
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error; // rethrow so caller knows connection failed
  }
  return cached.conn;
}
