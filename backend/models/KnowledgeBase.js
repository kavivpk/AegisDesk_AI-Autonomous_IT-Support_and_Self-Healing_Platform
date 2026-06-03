const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  category: {
    type: String,
    enum: ['Network', 'Software', 'Hardware', 'Security', 'Email', 'VPN', 'Server', 'General'],
    default: 'General'
  },
  fileType: {
    type: String,
    enum: ['pdf', 'docx', 'txt', 'manual', 'faq'],
    default: 'txt'
  },
  fileName: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  viewCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

knowledgeBaseSchema.index({ title: 'text', content: 'text' });
knowledgeBaseSchema.index({ category: 1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);