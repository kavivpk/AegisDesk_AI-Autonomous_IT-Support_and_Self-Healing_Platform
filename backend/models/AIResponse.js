const mongoose = require('mongoose');

const aiResponseSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  agentType: {
    type: String,
    enum: ['triage', 'solution', 'verification', 'escalation'],
    required: true
  },
  input: {
    type: String
  },
  response: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  retryCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['success', 'retry', 'escalated'],
    default: 'success'
  },
  sources: [{
    title: String,
    relevanceScore: Number
  }]
}, { timestamps: true });

aiResponseSchema.index({ ticketId: 1 });
aiResponseSchema.index({ agentType: 1 });

module.exports = mongoose.model('AIResponse', aiResponseSchema);