import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    const count = await User.countDocuments();
    console.log(`Total users in database: ${count}`);
    const users = await User.find({}, 'name email isAdmin');
    console.log(users);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
checkDB();
