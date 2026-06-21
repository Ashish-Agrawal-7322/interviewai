import mongoose from 'mongoose';
import dotenv from 'dotenv';
import JobClick from './models/JobClick.js';

dotenv.config();

const seedClicks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interviewai');
    
    // Create 8 dummy clicks to show on the graph
    const dummyClicks = Array(8).fill().map(() => ({
      jobId: `job_${Math.floor(Math.random() * 1000)}`,
      jobTitle: 'Software Engineer',
      company: 'Tech Corp'
    }));

    await JobClick.insertMany(dummyClicks);
    console.log('Seeded 8 dummy job clicks');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedClicks();
