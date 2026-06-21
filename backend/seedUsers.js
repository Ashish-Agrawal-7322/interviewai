import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Interview from './models/Interview.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const dummyUsers = [
      { name: 'Sarah Jenkins', email: 'sarah.j@example.com', password: hashedPassword, isAdmin: false, status: 'Active' },
      { name: 'Michael Chen', email: 'mchen99@example.com', password: hashedPassword, isAdmin: false, status: 'Active' },
      { name: 'David Rodriguez', email: 'david.rod@example.com', password: hashedPassword, isAdmin: false, status: 'Banned' },
      { name: 'Emily Clark', email: 'e.clark.dev@example.com', password: hashedPassword, isAdmin: false, status: 'Active' },
      { name: 'James Wilson', email: 'jwilson.tech@example.com', password: hashedPassword, isAdmin: false, status: 'Active' }
    ];

    let createdUsers = [];
    try {
      createdUsers = await User.insertMany(dummyUsers);
      console.log('Dummy users inserted');
    } catch(err) {
      createdUsers = await User.find({ email: { $in: dummyUsers.map(u => u.email) } });
    }

    const dummyInterviews = [];
    for (const user of createdUsers) {
      const numInterviews = Math.floor(Math.random() * 5); // 0 to 4 interviews
      for (let i = 0; i < numInterviews; i++) {
        dummyInterviews.push({
          user: user._id,
          role: ['Software Engineer', 'Product Manager', 'Data Scientist'][Math.floor(Math.random() * 3)],
          experience: ['Entry Level', 'Mid Level', 'Senior'][Math.floor(Math.random() * 3)],
          interviewType: ['Coding', 'Behavioral', 'System Design'][Math.floor(Math.random() * 3)],
          difficulty: 'Medium',
          status: 'Completed',
          overallScore: Math.floor(Math.random() * 40) + 60, // 60 to 99
          overallFeedback: 'Good performance.',
          questions: []
        });
      }
    }

    if (dummyInterviews.length > 0) {
      await Interview.insertMany(dummyInterviews);
      console.log('Dummy interviews inserted');
    }

    console.log('Data seeding complete!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();
