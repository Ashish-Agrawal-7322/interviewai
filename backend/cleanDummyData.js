import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Interview from './models/Interview.js';
import Resume from './models/Resume.js';

dotenv.config();

const cleanDummyData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    // Delete all users who are NOT admins
    await User.deleteMany({ isAdmin: false });
    
    // Delete all interviews and resumes
    await Interview.deleteMany({});
    await Resume.deleteMany({});
    
    console.log('All dummy candidates, interviews, and resumes have been purged from the database.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
cleanDummyData();
