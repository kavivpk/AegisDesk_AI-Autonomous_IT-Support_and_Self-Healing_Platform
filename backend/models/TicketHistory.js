const mongoose = require('mongoose');

const ticketHistorySchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  action: {
    type: String,
    enum: [
      'created', 'updated', 'assigned', 'status_changed',
      'escalated', 'resolved', 'closed', 'comment_added'
    ],
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  changes: {
    field: String,
    oldValue: String,
    newValue: String
  },
  comment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

ticketHistorySchema.index({ ticketId: 1 });
ticketHistorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('TicketHistory', ticketHistorySchema);