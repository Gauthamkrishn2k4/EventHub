import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export const disconnectDB = () => mongoose.disconnect();
