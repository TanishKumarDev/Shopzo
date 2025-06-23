import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'Ecommerce2025'
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error(error);
  }
};

export default connectDB;