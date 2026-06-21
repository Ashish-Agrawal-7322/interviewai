import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const recreateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    // Delete existing admin if any
    await User.deleteOne({ email: 'admin@university.edu' });

    // Create admin with plaintext password, let Mongoose schema hash it
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@university.edu',
      password: 'admin123',
      isAdmin: true,
      status: 'Active'
    });

    console.log('Admin account successfully recreated! ID:', adminUser._id);
    process.exit();
  } catch (error) {
    console.error('Error recreating admin:', error);
    process.exit(1);
  }
};

recreateAdmin();
