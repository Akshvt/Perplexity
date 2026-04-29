import mongoose from "mongoose";

let cached = null;

const connectDB = async () => {
    if (cached) return cached;
    cached = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${cached.connection.host}`);
    return cached;
};

export default connectDB;