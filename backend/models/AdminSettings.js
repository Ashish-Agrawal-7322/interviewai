import mongoose from 'mongoose';

const adminSettingsSchema = mongoose.Schema(
  {
    maxInterviewDuration: { type: Number, default: 60 }, // minutes
    enableFollowUpQuestions: { type: Boolean, default: true },
    aiDifficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    enableVoiceAnalysis: { type: Boolean, default: true },
    evaluationCriteria: {
      confidenceAnalysis: { type: Boolean, default: true },
      eyeContactAnalysis: { type: Boolean, default: true },
      technicalAccuracy: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
  }
);

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

export default AdminSettings;
