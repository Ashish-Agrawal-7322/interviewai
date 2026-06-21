import mongoose from 'mongoose';

const jobClickSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    jobId: { type: String, required: true },
    jobTitle: { type: String },
    company: { type: String }
  },
  { timestamps: true }
);

const JobClick = mongoose.model('JobClick', jobClickSchema);

export default JobClick;
