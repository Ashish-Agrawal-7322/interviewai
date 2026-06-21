import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Interview from './models/Interview.js';

dotenv.config();

const removePriya = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    const priya = await User.findOne({ email: 'priya.sharma@example.com' });
    if (priya) {
      await Interview.deleteMany({ user: priya._id });
      await User.deleteOne({ _id: priya._id });
      console.log('Removed Priya');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
removePriya();
