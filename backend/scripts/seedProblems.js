import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/problem.model.js';
import TestCase from '../models/testCase.model.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedProblems = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find an admin user (or create one)
    let admin = await User.findOne({ role: 'admin' });
if (!admin) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  admin = await User.create({
    handle: 'admin',
    email: 'admin@oj.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('✅ Admin user created with password: admin123');
}

    // Clear existing problems (for re-seeding)
    await Problem.deleteMany({});
    await TestCase.deleteMany({});

    const problems = [
      {
        title: "Two Sum",
        slug: "two-sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        difficulty: "Easy",
        constraints: "2 <= nums.length <= 10^4",
        timeLimit: 2,
        memoryLimit: 256,
        tags: ["Array", "HashMap"],
        sampleInput: "[2,7,11,15]\n9",
        sampleOutput: "[0,1]",
        createdBy: admin._id
      },
      {
        title: "Valid Parentheses",
        slug: "valid-parentheses",
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        difficulty: "Easy",
        constraints: "1 <= s.length <= 10^4",
        timeLimit: 1,
        memoryLimit: 128,
        tags: ["Stack", "String"],
        sampleInput: "()",
        sampleOutput: "true",
        createdBy: admin._id
      }
    ];

    for (const probData of problems) {
      const problem = await Problem.create(probData);

      // Add sample test cases
      await TestCase.create([
        {
          problemId: problem._id,
          input: probData.sampleInput,
          expectedOutput: probData.sampleOutput,
          isHidden: false,
          order: 1
        },
        {
          problemId: problem._id,
          input: "[3,2,4]\n6",
          expectedOutput: "[1,2]",
          isHidden: true,
          order: 2
        }
      ]);

      console.log(`✅ Problem created: ${problem.title}`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedProblems();