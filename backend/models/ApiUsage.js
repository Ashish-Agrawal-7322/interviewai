import mongoose from 'mongoose';

const apiUsageSchema = mongoose.Schema(
  {
    provider: { 
      type: String, 
      required: true, 
      enum: ['Gemini', 'Groq', 'JSearch', 'Resend'] 
    },
    count: { type: Number, default: 0 },
    date: { type: String, required: true }, // Format: YYYY-MM-DD for daily limits, YYYY-MM for monthly limits
    limitType: { type: String, enum: ['daily', 'monthly'], default: 'daily' }
  },
  {
    timestamps: true,
  }
);

const ApiUsage = mongoose.model('ApiUsage', apiUsageSchema);

export default ApiUsage;
