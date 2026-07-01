import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  }
}, { timestamps: true });

testCaseSchema.index({ problemId: 1 });

const TestCase = mongoose.model('TestCase', testCaseSchema);
export default TestCase;