import mongoose from "mongoose";

// Async function to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI); // Connect to MongoDB using MONGO_URI from .env
    console.log(`MongoDB connected: ${conn.connection.host}`); // Log successful connection
  } catch (error) {
    console.log("Error connecting to MONGODB", error.message); //  If there's an error during connection
    process.exit(1); // Exit the process with failure (1 = error)
  }
};

export default connectDB;
