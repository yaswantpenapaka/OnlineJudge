import Problem from '../models/problem.model.js';
import TestCase from '../models/testCase.model.js';
import { z } from 'zod';

// Validation Schema
const problemSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  constraints: z.string().min(1),
  timeLimit: z.number().optional(),
  memoryLimit: z.number().optional(),
  tags: z.array(z.string()).optional(),
  sampleInput: z.string().min(1),
  sampleOutput: z.string().min(1),
});

// @desc    Get all problems
export const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find().select('title slug difficulty tags').sort({ createdAt: -1 });
    res.json({ success: true, problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single problem
export const getProblemBySlug = async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    const testCases = await TestCase.find({ 
      problemId: problem._id, 
      isHidden: false 
    }).sort({ order: 1 });

    res.json({ success: true, problem, sampleTestCases: testCases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create problem (Admin only)
// @desc    Create problem with test cases (Admin only)
export const createProblem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create problems' });
    }

    const { title, slug, description, difficulty, constraints, timeLimit, memoryLimit, tags, sampleInput, sampleOutput, hiddenTestCases } = req.body;

    // Create Problem
    const problem = await Problem.create({
      title,
      slug,
      description,
      difficulty,
      constraints,
      timeLimit: timeLimit || 2,
      memoryLimit: memoryLimit || 256,
      tags: tags || [],
      sampleInput,
      sampleOutput,
      createdBy: req.user._id
    });

    // Create Sample Test Case
    await TestCase.create({
      problemId: problem._id,
      input: sampleInput,
      expectedOutput: sampleOutput,
      isHidden: false,
      order: 1
    });

    // Create Hidden Test Cases
    if (hiddenTestCases && Array.isArray(hiddenTestCases)) {
      for (let i = 0; i < hiddenTestCases.length; i++) {
        await TestCase.create({
          problemId: problem._id,
          input: hiddenTestCases[i].input,
          expectedOutput: hiddenTestCases[i].expectedOutput,
          isHidden: true,
          order: i + 2
        });
      }
    }

    res.status(201).json({ success: true, problem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update problem (Admin only)
export const updateProblem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can update problems' });
    }

    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    res.json({ success: true, problem });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete problem (Admin only)
export const deleteProblem = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can delete problems' });
    }

    const problem = await Problem.findByIdAndDelete(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    await TestCase.deleteMany({ problemId: req.params.id });
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get test cases for problem
export const getTestCases = async (req, res) => {
  try {
    const testCases = await TestCase.find({ problemId: req.params.problemId }).sort({ order: 1 });
    res.json({ success: true, testCases });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  getProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem,
  getTestCases
};