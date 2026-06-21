import mongoose from 'mongoose';

const questionSchema = mongoose.Schema({
  questionText: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  aiScore: { type: Number, default: 0 },
  aiFeedback: { type: String, default: '' },
});

const interviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    role: { type: String, required: true },
    experience: { type: String, required: true },
    interviewType: { type: String, required: true },
    language: { type: String, default: 'English' },
    targetCompany: { type: String, default: '' },
    govDetails: { type: mongoose.Schema.Types.Mixed },
    resumeSkills: [{ type: String }],
    status: { type: String, enum: ['Scheduled', 'In Progress', 'Completed', 'Evaluated'], default: 'Scheduled' },
    proctoringWarnings: {
      tabSwitch: { type: Number, default: 0 },
      faceMissing: { type: Number, default: 0 },
      micOff: { type: Number, default: 0 },
      copyPaste: { type: Number, default: 0 },
    },
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 3 },
    overallScore: { type: Number, default: 0 },
    overallFeedback: { type: String, default: '' },
    roadmap: { type: String, default: '' },
videoMetrics: {
  stressLevel: { type: Number, default: 0 },
  eyeContactScore: { type: Number, default: 0 },
  dominantExpression: { type: String, default: 'neutral' },
  hasVideoData: { type: Boolean, default: true }
},
    skills: [{
      name: { type: String },
      score: { type: Number }
    }]
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
