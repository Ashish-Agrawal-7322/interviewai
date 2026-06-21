import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Interview from './models/Interview.js';

dotenv.config();

const seedCandidates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    await User.deleteMany({ isAdmin: false });
    await Interview.deleteMany({});

    const candidate = await User.create({
      name: 'Ashish Agrawal',
      email: 'ashishagrawalxyz123@gmail.com',
      password: 'password123',
      isAdmin: false,
      status: 'Active'
    });

    await Interview.create({
      user: candidate._id,
      jobRole: 'Software Engineer',
      role: 'Software Engineer',
      experience: '2 years',
      interviewType: 'Technical',
      status: 'Completed',
      overallScore: 70,
      date: new Date()
    });

    await Interview.create({
      user: candidate._id,
      jobRole: 'Frontend Developer',
      role: 'Frontend Developer',
      experience: '3 years',
      interviewType: 'Technical',
      status: 'Completed',
      overallScore: 85,
      date: new Date()
    });

    const candidate2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      password: 'password123',
      isAdmin: false,
      status: 'Active'
    });

    await Interview.create({
      user: candidate2._id,
      jobRole: 'Data Scientist',
      role: 'Data Scientist',
      experience: '5 years',
      interviewType: 'Technical',
      status: 'Completed',
      overallScore: 92,
      date: new Date()
    });

    console.log('Dummy candidate data successfully seeded!');
    process.exit();
  } catch (error) {
    console.error('Error seeding candidates:', error);
    process.exit(1);
  }
};

seedCandidates();
