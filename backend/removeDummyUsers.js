import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Interview from './models/Interview.js';

dotenv.config();

const removeDummyUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    const emailsToRemove = [
      'sarah.j@example.com',
      'mchen99@example.com',
      'david.rod@example.com',
      'e.clark.dev@example.com',
      'jwilson.tech@example.com'
    ];

    const usersToDelete = await User.find({ email: { $in: emailsToRemove } });
    const userIds = usersToDelete.map(u => u._id);

    await Interview.deleteMany({ user: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });

    console.log('Dummy users and their interviews removed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error removing data:', error);
    process.exit(1);
  }
};

removeDummyUsers();
