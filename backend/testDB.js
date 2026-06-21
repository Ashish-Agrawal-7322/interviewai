import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Interview from './models/Interview.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const interviews = await Interview.find().sort({ createdAt: -1 }).limit(1);
  console.log(interviews[0]);
  process.exit(0);
});
