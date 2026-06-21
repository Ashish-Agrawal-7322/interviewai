import mongoose from 'mongoose';

const resumeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    resumeUrl: {
      type: String,
      required: true,
    },
    extractedSkills: {
      type: [String],
      required: true,
    },
    atsScore: {
      type: Number,
      required: true,
    },
    feedback: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
