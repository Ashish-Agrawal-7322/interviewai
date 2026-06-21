import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Admin from './models/Admin.js';

dotenv.config();

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    // Remove old admins from User collection
    await User.deleteMany({ isAdmin: true });
    await User.deleteMany({ email: 'admin@university.edu' }); // just in case

    // Delete existing admin from Admin collection
    await Admin.deleteMany({});

    // Create standalone admin account
    const adminAccount = await Admin.create({
      name: 'Super Admin',
      email: 'admin@university.edu',
      password: 'admin123',
      status: 'Active'
    });

    console.log('Isolated Admin account created successfully! ID:', adminAccount._id);
    console.log('All previous admin accounts have been wiped from the users database.');
    process.exit();
  } catch (error) {
    console.error('Error migrating admins:', error);
    process.exit(1);
  }
};

seedAdmins();
