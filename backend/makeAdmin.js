import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.updateMany({}, { isAdmin: true });
  console.log('All users are now admins!');
  process.exit();
});
