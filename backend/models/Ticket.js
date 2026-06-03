const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['Network', 'Software', 'Hardware', 'Security', 'Email', 'VPN', 'Server', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'],
    default: 'Open'
  },
  department: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Other'],
    default: 'Other'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  aiTriageResult: {
    category: String,
    priority: String,
    confidence: Number,
    summary: String
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date
  },
  escalatedAt: {
    type: Date
  }
}, { timestamps: true });

// Auto generate ticketId
ticketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Indexes
ticketSchema.index({ status: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ category: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);