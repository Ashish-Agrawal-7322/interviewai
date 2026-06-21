import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Admin from './models/Admin.js';

dotenv.config();

const restoreAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    // Delete existing admin from isolated Admin vault
    await Admin.deleteMany({});

    // Remove any leftover admins in Users collection just in case
    await User.deleteMany({ email: 'admin@university.edu' });

    // Recreate admin inside the unified Users collection
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@university.edu',
      password: 'admin123',
      isAdmin: true,
      status: 'Active'
    });

    console.log('Admin account successfully restored to Users collection! ID:', adminUser._id);
    process.exit();
  } catch (error) {
    console.error('Error restoring admin:', error);
    process.exit(1);
  }
};

restoreAdmin();
