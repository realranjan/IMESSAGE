import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    const mongoUrl = process.env.MONGO_URL; // consistent env variable name
    if (!mongoUrl) {
      throw new Error("MONGO_URL environment variable is required");
    }

    const connect = await mongoose.connect(mongoUrl);

    console.log(
      `✅ MongoDB connected: ${connect.connection.host}/${connect.connection.name}`,
    );

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed due to app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);

    // Retry logic (optional)
    setTimeout(connectDB, 5000); // retry after 5 seconds
  }
}
