import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import admin from '../middlewares/admin.middleware.js';
import problemController from '../controllers/problem.controller.js';

const router = express.Router();

// Public Routes
router.get('/', problemController.getProblems);
router.get('/:slug', problemController.getProblemBySlug);

// Protected + Admin Only Routes
router.post('/', protect, admin, problemController.createProblem);
router.put('/:id', protect, admin, problemController.updateProblem);
router.delete('/:id', protect, admin, problemController.deleteProblem);
router.get('/:problemId/testcases', protect, admin, problemController.getTestCases);

export default router;