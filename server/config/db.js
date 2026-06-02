import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // MONGO_URI needs to be in your .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1); // Exit process with failure
    }
};