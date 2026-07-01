import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const fixAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ handle: 'admin' });

    if (admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      admin.password = hashedPassword;
      await admin.save();

      console.log('✅ Admin password hashed successfully. Password is still: admin123');
    } else {
      console.log('No admin user found. Running seed again...');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdmin();