import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Resume from './models/Resume.js';

dotenv.config();

const seedResume = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview_db');
    
    const ashish = await User.findOne({ email: 'ashishagrawalxyz123@gmail.com' });
    if (ashish) {
      const existingResume = await Resume.findOne({ user: ashish._id });
      if (!existingResume) {
        await Resume.create({
          user: ashish._id,
          resumeUrl: '/uploads/ashish_resume.pdf',
          extractedSkills: ['React', 'Node.js', 'MongoDB', 'Python'],
          atsScore: 88,
          feedback: 'Strong frontend skills, good match for full-stack roles.'
        });
        console.log('Resume seeded for Ashish');
      } else {
        console.log('Resume already exists');
      }
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
seedResume();
