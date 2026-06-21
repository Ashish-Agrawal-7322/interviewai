import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interviewai');

    const adminExists = await User.findOne({ email: 'admin@university.edu' });

    if (adminExists) {
      console.log('Admin already exists. Updating password and privileges...');
      adminExists.password = 'admin123';
      adminExists.isAdmin = true;
      await adminExists.save();
      console.log('Admin user updated!');
    } else {
      await User.create({
        name: 'Super Admin',
        email: 'admin@university.edu',
        password: 'admin123',
        isAdmin: true,
      });
      console.log('Admin user created successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
